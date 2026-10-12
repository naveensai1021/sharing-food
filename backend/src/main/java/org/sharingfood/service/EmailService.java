package org.sharingfood.service;

import org.sharingfood.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Properties;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender autowiredMailSender;
    private final Environment env;

    @Value("${app.mail.from-email:${spring.mail.username:noreply@sharingfood.org}}")
    private String fromEmail;

    @Value("${app.mail.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.mail.sendgrid-api-key:}")
    private String sendgridApiKey;

    @Value("${spring.mail.host:${MAIL_HOST:}}")
    private String mailHost;

    @Value("${app.otp.demo-mode:${ENABLE_DEMO_OTP:${DEMO_MODE:${ALLOW_TEST_OTP:true}}}}")
    private boolean demoMode;

    @Value("${spring.mail.port:${MAIL_PORT:587}}")
    private int mailPort;

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String mailUsername;

    @Value("${spring.mail.password:${MAIL_PASSWORD:}}")
    private String mailPassword;

    @Value("${app.frontend.url:https://sharing-food-production.up.railway.app}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public EmailService(@Autowired(required = false) JavaMailSender autowiredMailSender, Environment env) {
        this.autowiredMailSender = autowiredMailSender;
        this.env = env;
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
                + "Thank you for registering on our food recovery network. To activate your account and submit your profile for administrator review, please enter the 6-digit verification code below:"
                + "</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<div style='display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border: 2px dashed #08783D; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #08783D; border-radius: 8px;'>"
                + verificationCode
                + "</div>"
                + "</div>"
                + "<p style='color: #dc2626; font-size: 14px; text-align: center; font-weight: 600;'>This verification code will expire in 5 minutes.</p>"
                + "<div style='text-align: center; margin: 25px 0;'>"
                + "<a href='" + verificationLink + "' style='display: inline-block; padding: 12px 24px; background-color: #08783D; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;'>Verify Email Online</a>"
                + "</div>"
                + "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />"
                + "<p style='color: #94a3b8; font-size: 12px; margin-bottom: 0;'>If you did not create an account on Sharing Food, please ignore this email.</p>"
                + "</div>"
                + "</div>";

        boolean sent = dispatchEmail(toEmail, subject, htmlContent, "Verification Code: " + verificationCode, true);
        if (!sent) {
            throw new BadRequestException("We couldn't send your verification code. Please try again or choose another verification method.");
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
        log.info("Attempting email dispatch to: [{}], Subject: {}", toEmail, subject);

        // 1. Try Resend API if key is present
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            String cleanKey = resendApiKey.trim().replaceAll("^[\"']+|[\"']+$", "").trim();
            if (!cleanKey.isEmpty() && !cleanKey.contains("your_api_key") && !cleanKey.equals("re_")) {
                try {
                    String sender = fromEmail;
                    if (sender == null || sender.trim().isEmpty() || sender.contains("@sharingfood.org") || sender.contains("noreply")) {
                        sender = "onboarding@resend.dev";
                    }
                    String payload = String.format(
                            "{\"from\":\"%s\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":\"%s\"}",
                            escapeJson(sender),
                            escapeJson(toEmail),
                            escapeJson(subject),
                            escapeJson(htmlContent)
                    );
                    HttpRequest req = HttpRequest.newBuilder()
                            .uri(URI.create("https://api.resend.com/emails"))
                            .header("Authorization", "Bearer " + cleanKey)
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                            .build();
                    HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                    if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                        log.info("Successfully delivered email via Resend to {}", toEmail);
                        return true;
                    } else {
                        log.warn("Resend API failed (HTTP {}): {}. Falling back to server logs.", resp.statusCode(), resp.body());
                    }
                } catch (Exception e) {
                    log.warn("Error calling Resend API: {}", e.getMessage());
                }
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

        // 3. Try SMTP via JavaMailSender or programmatically configured SMTP
        JavaMailSender activeMailSender = getActiveMailSender();
        if (activeMailSender != null && mailHost != null && !mailHost.trim().isEmpty()) {
            try {
                MimeMessage message = activeMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                activeMailSender.send(message);
                log.info("Successfully delivered email via SMTP to {}", toEmail);
                return true;
            } catch (Exception e) {
                log.warn("SMTP email dispatch on primary port {} failed: {}. Attempting fallback to port 465 with SSL...", mailPort, e.getMessage());
                if (mailPort != 465) {
                    try {
                        JavaMailSender sslSender = createSslMailSender(465);
                        MimeMessage sslMsg = sslSender.createMimeMessage();
                        MimeMessageHelper sslHelper = new MimeMessageHelper(sslMsg, true, "UTF-8");
                        sslHelper.setFrom(fromEmail);
                        sslHelper.setTo(toEmail);
                        sslHelper.setSubject(subject);
                        sslHelper.setText(htmlContent, true);
                        sslSender.send(sslMsg);
                        log.info("Successfully delivered email via SMTP fallback on port 465 (SSL) to {}", toEmail);
                        return true;
                    } catch (Exception sslEx) {
                        log.warn("SMTP fallback on port 465 also failed: {}", sslEx.getMessage());
                    }
                }
                if (isDevOrDemoEnvironment()) {
                    log.info("[OTP DISPATCH] Test/Demo Email OTP for {} (SMTP unreachable): {}", toEmail, fallbackLogSummary);
                    return true;
                }
                if (isMandatory) {
                    throw new BadRequestException("We couldn't send your verification code. Please try again or choose another verification method.");
                }
            }
        }

        // 4. In development profile or when demo/test mode is enabled, log OTP clearly for testing
        boolean isDevOrDemo = isDevOrDemoEnvironment();
        if (isDevOrDemo) {
            log.info("================================================================================");
            log.info("[OTP DISPATCH] Test/Demo Email OTP for {}: {}", toEmail, fallbackLogSummary);
            log.info("================================================================================");
            return true;
        }

        // In production without configured mail provider, report delivery failure
        log.error("================================================================================");
        log.error("[OTP DELIVERY FAILURE] No email provider (SMTP/Resend/SendGrid) is configured.");
        log.error("To receive real emails in Railway, set MAIL_HOST (and user/pass) or RESEND_API_KEY in Variables.");
        log.error("To test on Railway without external credentials, set ENABLE_DEMO_OTP=true in Variables.");
        log.error("================================================================================");
        return false;
    }

    private JavaMailSender getActiveMailSender() {
        if (mailHost != null && !mailHost.trim().isEmpty()) {
            int port = mailPort > 0 ? mailPort : 587;
            if (port == 465) {
                return createSslMailSender(465);
            }
            JavaMailSenderImpl impl = new JavaMailSenderImpl();
            impl.setHost(mailHost.trim());
            impl.setPort(port);
            if (mailUsername != null && !mailUsername.trim().isEmpty()) {
                impl.setUsername(mailUsername.trim());
            }
            if (mailPassword != null && !mailPassword.trim().isEmpty()) {
                impl.setPassword(mailPassword.trim());
            }
            Properties props = impl.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", mailUsername != null && !mailUsername.trim().isEmpty() ? "true" : "false");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.trust", "*");
            props.put("mail.smtp.connectiontimeout", "15000");
            props.put("mail.smtp.timeout", "15000");
            props.put("mail.smtp.writetimeout", "15000");
            return impl;
        }
        if (autowiredMailSender != null) {
            return autowiredMailSender;
        }
        return null;
    }

    private JavaMailSender createSslMailSender(int port) {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(mailHost != null ? mailHost.trim() : "smtp.gmail.com");
        impl.setPort(port);
        if (mailUsername != null && !mailUsername.trim().isEmpty()) {
            impl.setUsername(mailUsername.trim());
        }
        if (mailPassword != null && !mailPassword.trim().isEmpty()) {
            impl.setPassword(mailPassword.trim());
        }
        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.socketFactory.port", String.valueOf(port));
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtp.socketFactory.fallback", "false");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.connectiontimeout", "15000");
        props.put("mail.smtp.timeout", "15000");
        props.put("mail.smtp.writetimeout", "15000");
        return impl;
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
