package org.sharingfood.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.sms.twilio-account-sid:}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio-auth-token:}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio-from-number:}")
    private String twilioFromNumber;

    @Value("${app.sms.fast2sms-api-key:}")
    private String fast2smsApiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendVerificationOtp(String toPhone, String otp) {
        String message = "[Sharing Food] Your verification OTP is: " + otp + ". This code expires in 5 minutes. Do not share it with anyone.";
        return dispatchSms(toPhone, message, otp);
    }

    private boolean dispatchSms(String toPhone, String message, String otp) {
        if (toPhone == null || toPhone.trim().isEmpty()) {
            log.warn("Cannot dispatch SMS: Phone number is empty");
            return false;
        }

        String cleanedPhone = toPhone.trim().replaceAll("[^0-9+]", "");
        log.info("=========================================================");
        log.info("SMS DISPATCH ATTEMPT to [{}]: Message: {}", cleanedPhone, message);
        log.info("=========================================================");

        // 1. Try Fast2SMS (popular in India for +91 / 10-digit mobile numbers)
        if (fast2smsApiKey != null && !fast2smsApiKey.trim().isEmpty()) {
            try {
                String indianNumber = cleanedPhone.startsWith("+91") ? cleanedPhone.substring(3) : cleanedPhone;
                String jsonBody = String.format(
                        "{\"route\":\"otp\",\"variables_values\":\"%s\",\"numbers\":\"%s\"}",
                        otp,
                        indianNumber
                );
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                        .header("authorization", fast2smsApiKey.trim())
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("Successfully dispatched SMS via Fast2SMS to {}", cleanedPhone);
                    return true;
                } else {
                    log.warn("Fast2SMS API returned HTTP {}: {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Error calling Fast2SMS API: {}", e.getMessage());
            }
        }

        // 2. Try Twilio SMS if SID and Token are present
        if (twilioAccountSid != null && !twilioAccountSid.trim().isEmpty() &&
            twilioAuthToken != null && !twilioAuthToken.trim().isEmpty() &&
            twilioFromNumber != null && !twilioFromNumber.trim().isEmpty()) {
            try {
                String formattedTo = cleanedPhone.startsWith("+") ? cleanedPhone : "+91" + cleanedPhone;
                String formData = "To=" + URLEncoder.encode(formattedTo, StandardCharsets.UTF_8)
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
                    log.info("Successfully dispatched SMS via Twilio to {}", cleanedPhone);
                    return true;
                } else {
                    log.warn("Twilio SMS API returned HTTP {}: {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Error calling Twilio API: {}", e.getMessage());
            }
        }

        // 3. Fallback: Log OTP in development / simulation mode
        log.info("[SMS DEV SIMULATION] Verification OTP for {}: {}", cleanedPhone, otp);
        return true;
    }
}
