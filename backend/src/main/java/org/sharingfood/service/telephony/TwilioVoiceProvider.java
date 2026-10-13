package org.sharingfood.service.telephony;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TwilioVoiceProvider implements VoiceTelephonyProvider {

    private static final Logger log = LoggerFactory.getLogger(TwilioVoiceProvider.class);

    @Value("${app.voice.twilio.account-sid:${TWILIO_ACCOUNT_SID:}}")
    private String accountSid;

    @Value("${app.voice.twilio.auth-token:${TWILIO_AUTH_TOKEN:}}")
    private String authToken;

    @Value("${app.voice.twilio.from-number:${TWILIO_PHONE_NUMBER:${TWILIO_FROM_NUMBER:}}}")
    private String fromNumber;

    @Value("${app.voice.verify-signature:${VOICE_VERIFY_SIGNATURE:true}}")
    private boolean verifySignatureEnabled;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public String getProviderName() {
        return "TWILIO";
    }

    @Override
    public boolean isConfigured() {
        return accountSid != null && !accountSid.trim().isEmpty() &&
               authToken != null && !authToken.trim().isEmpty() &&
               fromNumber != null && !fromNumber.trim().isEmpty();
    }

    @Override
    public VoiceCallResult initiateOutboundCall(
            String toPhone,
            UUID challengeId,
            String webhookUrl,
            String statusCallbackUrl
    ) {
        if (!isConfigured()) {
            return VoiceCallResult.failure("TWILIO", "Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER required).");
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid.trim() + "/Calls.json";

            Map<String, String> formData = new HashMap<>();
            formData.put("To", toPhone);
            formData.put("From", fromNumber.trim());
            formData.put("Url", webhookUrl);
            formData.put("Method", "POST");
            if (statusCallbackUrl != null && !statusCallbackUrl.trim().isEmpty()) {
                formData.put("StatusCallback", statusCallbackUrl);
                formData.put("StatusCallbackMethod", "POST");
            }
            formData.put("Timeout", "30"); // Ring for max 30 seconds

            StringBuilder formBody = new StringBuilder();
            for (Map.Entry<String, String> entry : formData.entrySet()) {
                if (formBody.length() > 0) formBody.append("&");
                formBody.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                formBody.append("=");
                formBody.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            }

            String auth = accountSid.trim() + ":" + authToken.trim();
            String basicAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Basic " + basicAuth)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formBody.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String body = response.body();
                String callSid = extractJsonField(body, "sid");
                String status = extractJsonField(body, "status");
                log.info("Twilio outbound call placed successfully to [{}]. CallSid: {}, Status: {}", toPhone, callSid, status);
                return VoiceCallResult.success(callSid != null ? callSid : "CA" + UUID.randomUUID().toString().replace("-", ""), status != null ? status : "queued", "TWILIO");
            } else {
                String errorMsg = "Twilio call error HTTP " + response.statusCode() + ": " + response.body();
                log.error("Failed to initiate Twilio call to {}: {}", toPhone, errorMsg);
                return VoiceCallResult.failure("TWILIO", errorMsg);
            }
        } catch (Exception ex) {
            log.error("Exception initiating Twilio call to {}: {}", toPhone, ex.getMessage(), ex);
            return VoiceCallResult.failure("TWILIO", "Communication failure: " + ex.getMessage());
        }
    }

    @Override
    public boolean verifySignature(String fullUrl, Map<String, String> postParams, String signatureHeader) {
        if (!verifySignatureEnabled) {
            log.warn("Twilio signature verification is disabled via configuration.");
            return true;
        }

        if (signatureHeader == null || signatureHeader.trim().isEmpty()) {
            log.warn("Missing X-Twilio-Signature header.");
            return false;
        }

        if (authToken == null || authToken.trim().isEmpty()) {
            log.error("Cannot verify Twilio signature: TWILIO_AUTH_TOKEN is not configured.");
            return false;
        }

        try {
            // Standard Twilio HMAC-SHA1 validation:
            // 1. Take the full URL (e.g. https://domain.com/api/auth/voice/webhook?challengeId=...)
            // 2. Sort all POST parameters alphabetically by key
            // 3. Append each key and its value to the URL string
            // 4. Compute HMAC-SHA1 with authToken as secret
            // 5. Compare with signatureHeader (Base64)
            StringBuilder data = new StringBuilder(fullUrl);
            if (postParams != null && !postParams.isEmpty()) {
                List<String> sortedKeys = new ArrayList<>(postParams.keySet());
                Collections.sort(sortedKeys);
                for (String key : sortedKeys) {
                    data.append(key).append(postParams.get(key));
                }
            }

            Mac mac = Mac.getInstance("HmacSHA1");
            SecretKeySpec secretKey = new SecretKeySpec(authToken.trim().getBytes(StandardCharsets.UTF_8), "HmacSHA1");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.toString().getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getEncoder().encodeToString(rawHmac);

            boolean match = MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.trim().getBytes(StandardCharsets.UTF_8)
            );

            if (!match) {
                log.warn("Twilio signature mismatch. Expected: {}, Received: {}", expectedSignature, signatureHeader);
            }
            return match;
        } catch (Exception ex) {
            log.error("Error computing Twilio signature: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public String buildGatherTwiML(UUID challengeId, String language, String gatherActionUrl) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        String prompt = escapeXml(VoiceScript.getPromptMessage(langCode));
        String timeoutMsg = escapeXml(VoiceScript.getTimeoutMessage(langCode));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Gather numDigits=\"1\" action=\"" + escapeXml(gatherActionUrl) + "\" method=\"POST\" timeout=\"10\">\n" +
               "        <Say language=\"" + langCode + "\">" + prompt + "</Say>\n" +
               "    </Gather>\n" +
               "    <Say language=\"" + langCode + "\">" + timeoutMsg + "</Say>\n" +
               "    <Hangup/>\n" +
               "</Response>";
    }

    @Override
    public String buildConfirmationTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        String msg = escapeXml(VoiceScript.getConfirmationMessage(langCode));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + msg + "</Say>\n" +
               "    <Hangup/>\n" +
               "</Response>";
    }

    @Override
    public String buildDisputeTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        String msg = escapeXml(VoiceScript.getDisputeMessage(langCode));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + msg + "</Say>\n" +
               "    <Hangup/>\n" +
               "</Response>";
    }

    @Override
    public String buildTimeoutTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        String msg = escapeXml(VoiceScript.getTimeoutMessage(langCode));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + msg + "</Say>\n" +
               "    <Hangup/>\n" +
               "</Response>";
    }

    @Override
    public String buildInvalidDigitTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        String msg = escapeXml(VoiceScript.getInvalidDigitMessage(langCode));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + msg + "</Say>\n" +
               "    <Hangup/>\n" +
               "</Response>";
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }

    private String extractJsonField(String json, String key) {
        if (json == null) return null;
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
