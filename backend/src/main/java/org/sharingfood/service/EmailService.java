package org.sharingfood.service;

import org.sharingfood.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-email:${spring.mail.username:noreply@sharingfood.org}}")
    private String fromEmail;

    @Value("${app.mail.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.mail.sendgrid-api-key:}")
    private String sendgridApiKey;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String recipientName, String verificationCode, String verificationLink) {
        String subject = "Verify Your Email - Sharing Food, Spreading Love";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>"
                + "<div style='background-color: #08783D; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;'>"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Sharing Food, Spreading Love</h1>"
                + "</div>"
                + "<div style='padding: 24px; background-color: #ffffff;'>"
                + "<h2 style='color: #1e293b; margin-top: 0;'>Welcome, " + escapeHtml(recipientName) + "!</h2>"
                + "<p style='color: #475569; font-size: 16px; line-height: 1.5;'>"
                + "Thank you for registering on the platform. To activate your account and complete your registration, please verify your email address using the 6-digit code below:"
                + "</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<div style='display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border: 2px dashed #08783D; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #08783D; border-radius: 8px;'>"
                + verificationCode
                + "</div>"
                + "</div>"
                + "<p style='color: #dc2626; font-size: 14px; text-align: center; font-weight: 600;'>This verification code will expire in 5 minutes.</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "<a href='" + verificationLink + "' style='display: inline-block; padding: 12px 24px; background-color: #08783D; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;'>Verify Email Automatically</a>"
                + "</div>"
                + "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />"
                + "<p style='color: #94a3b8; font-size: 12px; margin-bottom: 0;'>If you did not create an account on Sharing Food, please ignore this email.</p>"
                + "</div>"
                + "</div>";

        boolean sent = dispatchEmail(toEmail, subject, htmlContent, "Verification Code: " + verificationCode, true);
        if (!sent) {
            throw new BadRequestException("Email delivery failed: No active email service (SMTP / Resend / SendGrid) is configured or reachable on the server. Please configure SMTP or RESEND_API_KEY.");
        }
    }

    public void sendPickupApprovedEmail(String toEmail, String recipientName, String donationTitle, String pickupOtp) {
        String subject = "Donation Request Approved! - Your Pickup OTP";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>"
                + "<div style='background-color: #08783D; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;'>"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Sharing Food, Spreading Love</h1>"
                + "</div>"
                + "<div style='padding: 24px; background-color: #ffffff;'>"
                + "<h2 style='color: #1e293b; margin-top: 0;'>Hello " + escapeHtml(recipientName) + ",</h2>"
                + "<p style='color: #475569; font-size: 16px;'>"
                + "Great news! The food supplier has approved your request for <strong>" + escapeHtml(donationTitle) + "</strong>."
                + "</p>"
                + "<p style='color: #475569; font-size: 16px;'>When collecting the food, present this secure Pickup OTP to the supplier:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<div style='display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border: 2px dashed #08783D; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #08783D; border-radius: 8px;'>"
                + pickupOtp
                + "</div>"
                + "</div>"
                + "<p style='color: #dc2626; font-size: 14px; text-align: center; font-weight: 500;'>This code expires in 15 minutes. You can also view it in your Beneficiary Dashboard.</p>"
                + "</div>"
                + "</div>";

        dispatchEmail(toEmail, subject, htmlContent, "Pickup OTP for '" + donationTitle + "': " + pickupOtp, false);
    }

    public void sendHandoverCompleteEmail(String toEmail, String recipientName, String donationTitle, int servings) {
        String subject = "Food Handover Verified - Thank You!";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>"
                + "<div style='background-color: #08783D; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;'>"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Sharing Food, Spreading Love</h1>"
                + "</div>"
                + "<div style='padding: 24px; background-color: #ffffff;'>"
                + "<h2 style='color: #1e293b; margin-top: 0;'>Handover Successful!</h2>"
                + "<p style='color: #475569; font-size: 16px;'>"
                + "The handover for <strong>" + escapeHtml(donationTitle) + "</strong> (" + servings + " estimated meals) has been confirmed via OTP verification."
                + "</p>"
                + "<p style='color: #475569; font-size: 16px;'>Thank you for your partnership in nourishing our community!</p>"
                + "</div>"
                + "</div>";

        dispatchEmail(toEmail, subject, htmlContent, "Handover completed for: " + donationTitle, false);
    }

    private boolean dispatchEmail(String toEmail, String subject, String htmlContent, String fallbackLogSummary, boolean isMandatory) {
        log.info("=========================================================");
        log.info("EMAIL DISPATCH ATTEMPT to [{}]: Subject: {}", toEmail, subject);
        log.info("Email Summary: {}", fallbackLogSummary);
        log.info("=========================================================");

        // 1. Try Resend API if key is present
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            try {
                String payload = String.format(
                        "{\"from\":\"%s\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":\"%s\"}",
                        escapeJson(fromEmail),
                        escapeJson(toEmail),
                        escapeJson(subject),
                        escapeJson(htmlContent)
                );
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + resendApiKey.trim())
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                    log.info("Successfully delivered email via Resend to {}", toEmail);
                    return true;
                } else {
                    log.warn("Resend API failed (HTTP {}): {}", resp.statusCode(), resp.body());
                }
            } catch (Exception e) {
                log.warn("Error calling Resend API: {}", e.getMessage());
            }
        }

        // 2. Try SendGrid API if key is present
        if (sendgridApiKey != null && !sendgridApiKey.trim().isEmpty()) {
            try {
                String payload = String.format(
                        "{\"personalizations\":[{\"to\":[{\"email\":\"%s\"}]}],\"from\":{\"email\":\"%s\"},\"subject\":\"%s\",\"content\":[{\"type\":\"text/html\",\"value\":\"%s\"}]}",
                        escapeJson(toEmail),
                        escapeJson(fromEmail),
                        escapeJson(subject),
                        escapeJson(htmlContent)
                );
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.sendgrid.com/v3/mail/send"))
                        .header("Authorization", "Bearer " + sendgridApiKey.trim())
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                        .build();
                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                    log.info("Successfully delivered email via SendGrid to {}", toEmail);
                    return true;
                } else {
                    log.warn("SendGrid API failed (HTTP {}): {}", resp.statusCode(), resp.body());
                }
            } catch (Exception e) {
                log.warn("Error calling SendGrid API: {}", e.getMessage());
            }
        }

        // 3. Try SMTP via JavaMailSender if host is configured
        if (mailSender != null && mailHost != null && !mailHost.trim().isEmpty()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("Successfully delivered email via SMTP to {}", toEmail);
                return true;
            } catch (Exception e) {
                log.warn("SMTP email dispatch failed: {}", e.getMessage());
                if (isMandatory) {
                    throw new BadRequestException("Email delivery failed via SMTP: " + e.getMessage());
                }
            }
        }

        // If no provider configured: allow dev/test fallback
        if ((resendApiKey == null || resendApiKey.trim().isEmpty()) &&
            (sendgridApiKey == null || sendgridApiKey.trim().isEmpty()) &&
            (mailHost == null || mailHost.trim().isEmpty())) {
            log.info("[EMAIL DEV SIMULATION] Verification email simulated for {}: {}", toEmail, fallbackLogSummary);
            return true;
        }

        // If configured providers failed:
        return false;
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
