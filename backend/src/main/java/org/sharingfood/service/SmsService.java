package org.sharingfood.service;

import org.sharingfood.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final Environment env;

    @Value("${app.sms.msg91-auth-key:${MSG91_AUTH_KEY:${SMS_AUTH_KEY:${SMS_API_KEY:}}}}")
    private String msg91AuthKey;

    @Value("${app.sms.msg91-template-id:${MSG91_TEMPLATE_ID:${SMS_TEMPLATE_ID:}}}")
    private String msg91TemplateId;

    @Value("${app.sms.msg91-sender-id:${MSG91_SENDER_ID:${SMS_SENDER_ID:SHFOOD}}}")
    private String msg91SenderId;

    @Value("${app.sms.fast2sms-api-key:${FAST2SMS_API_KEY:${SMS_API_KEY:}}}")
    private String fast2smsApiKey;

    @Value("${app.sms.twilio-account-sid:${TWILIO_ACCOUNT_SID:}}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio-auth-token:${TWILIO_AUTH_TOKEN:}}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio-from-number:${TWILIO_FROM_NUMBER:}}")
    private String twilioFromNumber;

    @Value("${app.sms.gateway-url:${SMS_GATEWAY_URL:}}")
    private String customGatewayUrl;

    @Value("${app.otp.demo-mode:${ENABLE_DEMO_OTP:${DEMO_MODE:${ALLOW_TEST_OTP:false}}}}")
    private boolean demoMode;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public SmsService(Environment env) {
        this.env = env;
    }

    public boolean sendVerificationOtp(String toPhone, String otp) {
        if (toPhone == null || toPhone.trim().isEmpty()) {
            throw new BadRequestException("Mobile number is required for SMS OTP verification.");
        }

        String normalizedPhone = normalizePhoneNumber(toPhone);
        String message = "[Sharing Food] Your verification code is: " + otp + ". Valid for 5 minutes. Do not share it with anyone.";

        boolean success = dispatchSms(normalizedPhone, message, otp);
        if (!success) {
            throw new BadRequestException("We couldn't send your verification code. Please try again or choose another verification method.");
        }
        return true;
    }

    public String normalizePhoneNumber(String phone) {
        if (phone == null) return "";
        String clean = phone.trim().replaceAll("[^0-9+]", "");
        if (clean.startsWith("+")) {
            return clean;
        }
        // Normalize 10-digit Indian numbers to E.164 (+91)
        if (clean.length() == 10) {
            return "+91" + clean;
        }
        // If starts with 0 and length is 11 (e.g. 09876543210)
        if (clean.length() == 11 && clean.startsWith("0")) {
            return "+91" + clean.substring(1);
        }
        // If 12 digits starting with 91
        if (clean.length() == 12 && clean.startsWith("91")) {
            return "+" + clean;
        }
        return "+" + clean;
    }

    private boolean dispatchSms(String normalizedPhone, String message, String otp) {
        log.info("Attempting SMS dispatch to [{}]", normalizedPhone);

        // 1. Try MSG91 OTP API (DLT-compliant Indian gateway)
        if (msg91AuthKey != null && !msg91AuthKey.trim().isEmpty() &&
            msg91TemplateId != null && !msg91TemplateId.trim().isEmpty()) {
            try {
                String phoneDigits = normalizedPhone.replace("+", "");
                String endpoint = String.format(
                        "https://control.msg91.com/api/v5/otp?template_id=%s&mobile=%s&authkey=%s&otp=%s",
                        URLEncoder.encode(msg91TemplateId.trim(), StandardCharsets.UTF_8),
                        URLEncoder.encode(phoneDigits, StandardCharsets.UTF_8),
                        URLEncoder.encode(msg91AuthKey.trim(), StandardCharsets.UTF_8),
                        URLEncoder.encode(otp, StandardCharsets.UTF_8)
                );
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Successfully dispatched SMS via MSG91 to {}", normalizedPhone);
                    return true;
                } else {
                    log.warn("MSG91 API failed (HTTP {}): {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Error calling MSG91 API: {}", e.getMessage());
            }
        }

        // 2. Try Fast2SMS (Indian Bulk SMS provider)
        if (fast2smsApiKey != null && !fast2smsApiKey.trim().isEmpty()) {
            try {
                String raw10Digits = normalizedPhone.startsWith("+91") ? normalizedPhone.substring(3) : normalizedPhone.replace("+", "");
                String jsonBody = String.format(
                        "{\"route\":\"otp\",\"variables_values\":\"%s\",\"numbers\":\"%s\"}",
                        otp,
                        raw10Digits
                );
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                        .header("authorization", fast2smsApiKey.trim())
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Successfully dispatched SMS via Fast2SMS to {}", normalizedPhone);
                    return true;
                } else {
                    log.warn("Fast2SMS API failed (HTTP {}): {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Error calling Fast2SMS API: {}", e.getMessage());
            }
        }

        // 3. Try Twilio SMS
        if (twilioAccountSid != null && !twilioAccountSid.trim().isEmpty() &&
            twilioAuthToken != null && !twilioAuthToken.trim().isEmpty() &&
            twilioFromNumber != null && !twilioFromNumber.trim().isEmpty()) {
            try {
                String formData = "To=" + URLEncoder.encode(normalizedPhone, StandardCharsets.UTF_8)
                        + "&From=" + URLEncoder.encode(twilioFromNumber.trim(), StandardCharsets.UTF_8)
                        + "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

                String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                        (twilioAccountSid.trim() + ":" + twilioAuthToken.trim()).getBytes(StandardCharsets.UTF_8)
                );

                String twilioUrl = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid.trim() + "/Messages.json";
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(twilioUrl))
                        .header("Authorization", authHeader)
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(formData, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Successfully dispatched SMS via Twilio to {}", normalizedPhone);
                    return true;
                } else {
                    log.warn("Twilio SMS API failed (HTTP {}): {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Error calling Twilio API: {}", e.getMessage());
            }
        }

        // 4. Try Custom Gateway URL if provided
        if (customGatewayUrl != null && !customGatewayUrl.trim().isEmpty()) {
            try {
                String resolvedUrl = customGatewayUrl.replace("{phone}", URLEncoder.encode(normalizedPhone, StandardCharsets.UTF_8))
                        .replace("{otp}", URLEncoder.encode(otp, StandardCharsets.UTF_8))
                        .replace("{message}", URLEncoder.encode(message, StandardCharsets.UTF_8));
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(resolvedUrl))
                        .GET()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Successfully dispatched SMS via custom gateway to {}", normalizedPhone);
                    return true;
                }
            } catch (Exception e) {
                log.warn("Error calling custom SMS gateway: {}", e.getMessage());
            }
        }

        // 5. In development profile or when demo/test mode is enabled, log OTP clearly for testing
        boolean isDevOrDemo = isDevOrDemoEnvironment();
        if (isDevOrDemo) {
            log.info("================================================================================");
            log.info("[OTP DISPATCH] Test/Demo Mobile SMS OTP for {}: {}", normalizedPhone, otp);
            log.info("================================================================================");
            return true;
        }

        log.error("================================================================================");
        log.error("[OTP DELIVERY FAILURE] No SMS gateway (MSG91 / Fast2SMS / Twilio) is configured.");
        log.error("To receive real SMS in Railway, set FAST2SMS_API_KEY or MSG91_AUTH_KEY in Variables.");
        log.error("To test on Railway without external credentials, set ENABLE_DEMO_OTP=true in Variables.");
        log.error("================================================================================");
        return false;
    }

    private boolean isDevOrDemoEnvironment() {
        if (demoMode ||
            "true".equalsIgnoreCase(System.getenv("ENABLE_DEMO_OTP")) ||
            "true".equalsIgnoreCase(System.getenv("DEMO_MODE")) ||
            "true".equalsIgnoreCase(System.getenv("ALLOW_TEST_OTP"))) {
            return true;
        }
        if (env == null) return false;
        String[] profiles = env.getActiveProfiles();
        for (String p : profiles) {
            if ("dev".equalsIgnoreCase(p) || "local".equalsIgnoreCase(p) || "test".equalsIgnoreCase(p) || "demo".equalsIgnoreCase(p)) {
                return true;
            }
        }
        return profiles.length == 0;
    }
}
