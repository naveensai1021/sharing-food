package org.sharingfood.service;

import jakarta.servlet.http.HttpServletRequest;
import org.sharingfood.dto.VoiceCallRetryRequest;
import org.sharingfood.dto.VoiceCallStartRequest;
import org.sharingfood.dto.VoiceCallStatusResponse;
import org.sharingfood.entity.RegistrationOtpChallenge;
import org.sharingfood.entity.User;
import org.sharingfood.entity.UserProfile;
import org.sharingfood.entity.UserStatus;
import org.sharingfood.exception.BadRequestException;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.RegistrationOtpChallengeRepository;
import org.sharingfood.repository.UserProfileRepository;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.service.telephony.MockVoiceProvider;
import org.sharingfood.service.telephony.TwilioVoiceProvider;
import org.sharingfood.service.telephony.VoiceCallResult;
import org.sharingfood.service.telephony.VoiceTelephonyProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class VoiceVerificationService {

    private static final Logger log = LoggerFactory.getLogger(VoiceVerificationService.class);

    private final RegistrationOtpChallengeRepository otpChallengeRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final TwilioVoiceProvider twilioVoiceProvider;
    private final MockVoiceProvider mockVoiceProvider;

    @Value("${app.voice.base-url:${BACKEND_URL:https://adequate-possibility-production-8080.up.railway.app}}")
    private String voiceBaseUrl;

    @Value("${app.voice.provider:AUTO}")
    private String configuredProvider;

    @Value("${app.voice.verify-signature:${VOICE_VERIFY_SIGNATURE:true}}")
    private boolean verifySignatureEnabled;

    @Value("${app.voice.cooldown-seconds:60}")
    private int cooldownSeconds;

    @Value("${app.voice.max-attempts:5}")
    private int maxAttempts;

    public VoiceVerificationService(
            RegistrationOtpChallengeRepository otpChallengeRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            TwilioVoiceProvider twilioVoiceProvider,
            MockVoiceProvider mockVoiceProvider
    ) {
        this.otpChallengeRepository = otpChallengeRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.twilioVoiceProvider = twilioVoiceProvider;
        this.mockVoiceProvider = mockVoiceProvider;
    }

    public VoiceTelephonyProvider getActiveProvider() {
        if ("TWILIO".equalsIgnoreCase(configuredProvider)) {
            return twilioVoiceProvider;
        }
        if ("MOCK".equalsIgnoreCase(configuredProvider)) {
            return mockVoiceProvider;
        }
        // AUTO selection
        if (twilioVoiceProvider.isConfigured()) {
            return twilioVoiceProvider;
        }
        return mockVoiceProvider;
    }

    private String formatPhoneNumber(String phone) {
        if (phone == null) return "";
        String cleaned = phone.replaceAll("[^0-9+]", "");
        if (cleaned.startsWith("+")) {
            return cleaned;
        }
        if (cleaned.length() == 10) {
            return "+91" + cleaned;
        }
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            return "+" + cleaned;
        }
        return "+" + cleaned;
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    @Transactional
    public VoiceCallStatusResponse startVoiceVerification(VoiceCallStartRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String language = request.getLanguage() != null && !request.getLanguage().trim().isEmpty()
                ? request.getLanguage().trim()
                : "en-IN";

        User user = resolveUser(email, phone);
        if (user == null) {
            throw new BadRequestException("No registered account found with the provided email or phone.");
        }

        if (user.getStatus() != UserStatus.PENDING_OTP_VERIFICATION) {
            if (user.getStatus() == UserStatus.PENDING_ADMIN_APPROVAL || user.getStatus() == UserStatus.APPROVED) {
                throw new BadRequestException("This account is already verified and waiting for admin review or active.");
            }
            throw new BadRequestException("Registration is not eligible for verification (Status: " + user.getStatus() + ").");
        }

        // Check if phone number is attached
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String registeredPhone = profile != null && profile.getPhone() != null ? profile.getPhone().trim() : phone;
        if (registeredPhone.isEmpty()) {
            throw new BadRequestException("Mobile number is required for voice call verification.");
        }
        String formattedPhone = formatPhoneNumber(registeredPhone);

        // Check cooldown
        if (user.getLastVerificationSentAt() != null) {
            long secondsSince = Duration.between(user.getLastVerificationSentAt(), Instant.now()).getSeconds();
            if (secondsSince < cooldownSeconds) {
                long waitTime = cooldownSeconds - secondsSince;
                throw new BadRequestException("Please wait " + waitTime + " seconds before requesting another verification call.");
            }
        }

        // Rate limit check
        if (user.getResendCount() >= maxAttempts) {
            throw new BadRequestException("Maximum voice call verification attempts reached (" + maxAttempts + "). Please register again or use email verification.");
        }

        // Invalidate previous unconsumed challenges
        otpChallengeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(c -> c.getConsumedAt() == null)
                .forEach(c -> {
                    c.setConsumedAt(Instant.now());
                    otpChallengeRepository.save(c);
                });

        // Create new challenge
        String dummyToken = UUID.randomUUID().toString();
        RegistrationOtpChallenge challenge = new RegistrationOtpChallenge(
                user,
                formattedPhone,
                "VOICE_CALL",
                sha256Hex(dummyToken),
                Instant.now().plus(Duration.ofMinutes(5)),
                Instant.now().plus(Duration.ofSeconds(cooldownSeconds)),
                httpRequest != null ? httpRequest.getRemoteAddr() : "CLIENT_IP"
        );
        challenge.setCallStatus("INITIATED");
        challenge.setVerificationResult("PENDING");
        challenge.setAttemptCount(user.getResendCount() + 1);
        challenge.setMaxAttempts(maxAttempts);
        challenge = otpChallengeRepository.save(challenge);

        // Update user
        user.setVerificationMethod("VOICE_CALL");
        user.setResendCount(user.getResendCount() + 1);
        user.setLastVerificationSentAt(Instant.now());
        userRepository.save(user);

        // Initiate call via active provider
        VoiceCallResult callResult = dispatchOutboundCall(challenge, formattedPhone, language);

        if (!callResult.isSuccess()) {
            challenge.setCallStatus("FAILED");
            challenge.setVerificationResult("CALL_FAILED");
            otpChallengeRepository.save(challenge);
            throw new BadRequestException("Failed to initiate voice call: " + callResult.getErrorMessage());
        }

        challenge.setProviderCallId(callResult.getCallSid());
        challenge.setCallStatus(callResult.getStatus());
        otpChallengeRepository.save(challenge);

        log.info("[VOICE VERIFICATION] Call successfully initiated for User [{}] to [{}] via [{}] (Call SID: {})",
                user.getEmail(), formattedPhone, callResult.getProviderName(), callResult.getCallSid());


        return buildStatusResponse(challenge, user, "Automated verification call initiated. Please answer the phone and follow the keypad prompts.");
    }

    @Transactional
    public VoiceCallStatusResponse retryVoiceVerification(VoiceCallRetryRequest request, HttpServletRequest httpRequest) {
        UUID challengeId = request.getChallengeId();
        RegistrationOtpChallenge challenge = null;

        if (challengeId != null) {
            challenge = otpChallengeRepository.findById(challengeId).orElse(null);
        }

        User user = null;
        if (challenge != null) {
            user = challenge.getUser();
        } else {
            user = resolveUser(request.getEmail(), request.getPhone());
        }

        if (user == null) {
            throw new BadRequestException("No registered account found matching the provided details.");
        }

        if (user.getStatus() != UserStatus.PENDING_OTP_VERIFICATION) {
            throw new BadRequestException("Registration is not in pending verification status.");
        }

        // Delegate to startVoiceVerification
        VoiceCallStartRequest startRequest = new VoiceCallStartRequest(
                user.getEmail(),
                request.getPhone(),
                request.getLanguage()
        );
        return startVoiceVerification(startRequest, httpRequest);
    }

    private VoiceCallResult dispatchOutboundCall(RegistrationOtpChallenge challenge, String toPhone, String language) {
        String baseUrl = cleanBaseUrl(voiceBaseUrl);
        String langParam = language != null ? "&lang=" + language : "";
        String webhookUrl = baseUrl + "/api/auth/voice/webhook?challengeId=" + challenge.getId() + langParam;
        String statusCallbackUrl = baseUrl + "/api/auth/voice/status-callback?challengeId=" + challenge.getId();

        VoiceTelephonyProvider provider = getActiveProvider();
        log.info("[VOICE DISPATCH] Using provider [{}] for challenge [{}] -> to: {}", provider.getProviderName(), challenge.getId(), toPhone);
        return provider.initiateOutboundCall(toPhone, challenge.getId(), webhookUrl, statusCallbackUrl);
    }

    public void initiateVoiceCallForChallenge(RegistrationOtpChallenge challenge, String language) {
        String phone = challenge.getTargetContact();
        String formattedPhone = formatPhoneNumber(phone);
        VoiceCallResult result = dispatchOutboundCall(challenge, formattedPhone, language);
        if (result.isSuccess()) {
            challenge.setProviderCallId(result.getCallSid());
            challenge.setCallStatus(result.getStatus());

            otpChallengeRepository.save(challenge);
        } else {
            challenge.setCallStatus("FAILED");
            challenge.setVerificationResult("CALL_FAILED");
            otpChallengeRepository.save(challenge);
            log.error("[VOICE DISPATCH ERROR] Failed to dispatch call for challenge [{}]: {}", challenge.getId(), result.getErrorMessage());
        }
    }

    @Transactional
    public String handleInitialCallWebhook(
            UUID challengeId,
            String language,
            Map<String, String> postParams,
            String signatureHeader,
            String requestUrl
    ) {
        VoiceTelephonyProvider provider = getActiveProvider();
        validateWebhookSignature(provider, requestUrl, postParams, signatureHeader);

        Optional<RegistrationOtpChallenge> challengeOpt = resolveChallenge(challengeId, postParams.get("CallSid"));
        if (!challengeOpt.isPresent()) {
            log.warn("[VOICE WEBHOOK] Unknown challenge [{}] or CallSid [{}]", challengeId, postParams.get("CallSid"));
            return provider.buildTimeoutTwiML(language);
        }

        RegistrationOtpChallenge challenge = challengeOpt.get();
        if (challenge.getConsumedAt() != null || challenge.getExpiresAt().isBefore(Instant.now())) {
            log.warn("[VOICE WEBHOOK] Challenge [{}] has already been consumed or expired", challenge.getId());
            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>This verification request has expired. Goodbye.</Say><Hangup/></Response>";
        }

        challenge.setCallStatus("IN_PROGRESS");
        otpChallengeRepository.save(challenge);

        String baseUrl = cleanBaseUrl(voiceBaseUrl);
        String langParam = language != null ? "&lang=" + language : "";
        String gatherActionUrl = baseUrl + "/api/auth/voice/gather?challengeId=" + challenge.getId() + langParam;

        return provider.buildGatherTwiML(challenge.getId(), language, gatherActionUrl);
    }

    @Transactional
    public String handleGatherWebhook(
            UUID challengeId,
            String language,
            Map<String, String> postParams,
            String signatureHeader,
            String requestUrl
    ) {
        VoiceTelephonyProvider provider = getActiveProvider();
        validateWebhookSignature(provider, requestUrl, postParams, signatureHeader);

        Optional<RegistrationOtpChallenge> challengeOpt = resolveChallenge(challengeId, postParams.get("CallSid"));
        if (!challengeOpt.isPresent()) {
            log.warn("[VOICE GATHER] Challenge [{}] not found", challengeId);
            return provider.buildTimeoutTwiML(language);
        }

        RegistrationOtpChallenge challenge = challengeOpt.get();
        User user = challenge.getUser();

        // Security check: verify challenge is active
        if (challenge.getConsumedAt() != null) {
            log.warn("[VOICE GATHER] Replay attempt on consumed challenge [{}]", challenge.getId());
            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>This verification has already been processed. Goodbye.</Say><Hangup/></Response>";
        }

        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            log.warn("[VOICE GATHER] Challenge [{}] has expired", challenge.getId());
            challenge.setCallStatus("EXPIRED");
            challenge.setVerificationResult("EXPIRED");
            otpChallengeRepository.save(challenge);
            return provider.buildTimeoutTwiML(language);
        }

        String digits = postParams.get("Digits");
        log.info("[VOICE GATHER] Challenge [{}], received DTMF Digits: [{}]", challenge.getId(), digits);

        if (digits != null) {
            digits = digits.trim();
            challenge.setDtmfDigit(digits);
        }

        if ("1".equals(digits)) {
            // PRESS 1: ACCOUNT CONFIRMATION
            log.info("[VOICE GATHER] Account CONFIRMED by user for challenge [{}] (User: {})", challenge.getId(), user.getEmail());
            challenge.setVerificationResult("CONFIRMED");
            challenge.setVerifiedAt(Instant.now());
            challenge.setConsumedAt(Instant.now());
            challenge.setCallStatus("COMPLETED");
            otpChallengeRepository.save(challenge);

            // Update user state to PENDING_ADMIN_APPROVAL
            user.setPhoneVerified(true);
            user.setPhoneVerifiedAt(Instant.now());
            user.setVoiceVerified(true);
            user.setVoiceVerifiedAt(Instant.now());
            user.setStatus(UserStatus.PENDING_ADMIN_APPROVAL);
            userRepository.save(user);

            log.info("[VOICE GATHER] User [{}] mobile verified via Voice Call. Status transitioned to PENDING_ADMIN_APPROVAL.", user.getEmail());
            return provider.buildConfirmationTwiML(language);

        } else if ("2".equals(digits)) {
            // PRESS 2: ACCOUNT NOT CREATED / DISPUTE
            log.warn("[VOICE SECURITY ALERT] Registration DISPUTED by mobile recipient for challenge [{}] (User: {})",
                    challenge.getId(), user.getEmail());
            challenge.setVerificationResult("DISPUTED");
            challenge.setDisputedAt(Instant.now());
            challenge.setConsumedAt(Instant.now());
            challenge.setCallStatus("COMPLETED");
            otpChallengeRepository.save(challenge);

            // Keep registration unverified & blocked from reaching admin approval
            user.setPhoneVerified(false);
            user.setVoiceVerified(false);
            // Invalidate any outstanding challenges
            otpChallengeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .filter(c -> c.getConsumedAt() == null)
                    .forEach(c -> {
                        c.setConsumedAt(Instant.now());
                        otpChallengeRepository.save(c);
                    });
            userRepository.save(user);

            return provider.buildDisputeTwiML(language);

        } else if (digits == null || digits.isEmpty()) {
            // Timeout / no digit entered
            log.info("[VOICE GATHER] No DTMF digits entered for challenge [{}]", challenge.getId());
            challenge.setCallStatus("NO_INPUT");
            challenge.setVerificationResult("NO_INPUT");
            otpChallengeRepository.save(challenge);
            return provider.buildTimeoutTwiML(language);

        } else {
            // Invalid key pressed
            log.warn("[VOICE GATHER] Invalid DTMF digit entered: [{}] for challenge [{}]", digits, challenge.getId());
            return provider.buildInvalidDigitTwiML(language);
        }
    }

    @Transactional
    public void handleStatusCallback(
            UUID challengeId,
            Map<String, String> postParams,
            String signatureHeader,
            String requestUrl
    ) {
        VoiceTelephonyProvider provider = getActiveProvider();
        validateWebhookSignature(provider, requestUrl, postParams, signatureHeader);

        Optional<RegistrationOtpChallenge> challengeOpt = resolveChallenge(challengeId, postParams.get("CallSid"));
        if (!challengeOpt.isPresent()) {
            return;
        }

        RegistrationOtpChallenge challenge = challengeOpt.get();
        String callStatus = postParams.get("CallStatus");
        log.info("[VOICE STATUS CALLBACK] Challenge [{}], CallStatus: {}", challenge.getId(), callStatus);

        if (callStatus != null) {
            challenge.setCallStatus(callStatus.toUpperCase());
            if (("BUSY".equalsIgnoreCase(callStatus) || "NO-ANSWER".equalsIgnoreCase(callStatus) || "FAILED".equalsIgnoreCase(callStatus))
                    && "PENDING".equals(challenge.getVerificationResult())) {
                challenge.setVerificationResult(callStatus.toUpperCase().replace("-", "_"));
            }
            otpChallengeRepository.save(challenge);
        }
    }

    @Transactional(readOnly = true)
    public VoiceCallStatusResponse getVoiceCallStatus(UUID challengeId, String email, String phone) {
        RegistrationOtpChallenge challenge = null;

        if (challengeId != null) {
            challenge = otpChallengeRepository.findById(challengeId).orElse(null);
        }

        if (challenge == null) {
            User user = resolveUser(email, phone);
            if (user != null) {
                challenge = otpChallengeRepository.findFirstByUserAndVerificationMethodAndConsumedAtIsNullOrderByCreatedAtDesc(user, "VOICE_CALL")
                        .orElse(null);
                if (challenge == null) {
                    challenge = otpChallengeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                            .filter(c -> "VOICE_CALL".equalsIgnoreCase(c.getVerificationMethod()))
                            .findFirst()
                            .orElse(null);
                }
            }
        }

        if (challenge == null) {
            throw new ResourceNotFoundException("No active voice call challenge found for the provided information.");
        }

        User user = challenge.getUser();
        String message = resolveStatusMessage(challenge, user);

        return buildStatusResponse(challenge, user, message);
    }

    private String resolveStatusMessage(RegistrationOtpChallenge challenge, User user) {
        if ("CONFIRMED".equalsIgnoreCase(challenge.getVerificationResult()) || user.isVoiceVerified() || user.isPhoneVerified()) {
            return "Phone verified successfully! Your application has been submitted for Admin Approval.";
        }
        if ("DISPUTED".equalsIgnoreCase(challenge.getVerificationResult())) {
            return "Verification was rejected (Account Not Created was pressed). Please register with a verified mobile number.";
        }
        if ("FAILED".equalsIgnoreCase(challenge.getCallStatus()) || "CALL_FAILED".equalsIgnoreCase(challenge.getVerificationResult())) {
            return "Call could not be placed. Please verify your phone number and try again or use Email OTP.";
        }
        if ("BUSY".equalsIgnoreCase(challenge.getCallStatus()) || "NO-ANSWER".equalsIgnoreCase(challenge.getCallStatus()) || "NO_ANSWER".equalsIgnoreCase(challenge.getVerificationResult())) {
            return "The phone was unanswered or busy. You can retry after the cooldown period.";
        }
        if (challenge.getExpiresAt().isBefore(Instant.now())) {
            return "The verification call window has expired. Please request a new call or choose SMS/Email.";
        }
        return "Calling your mobile number... Please answer the phone and press 1 to confirm your account.";
    }

    private VoiceCallStatusResponse buildStatusResponse(RegistrationOtpChallenge challenge, User user, String message) {
        long cooldownLeft = 0;
        if (challenge.getResendAvailableAt() != null) {
            long remaining = Duration.between(Instant.now(), challenge.getResendAvailableAt()).getSeconds();
            if (remaining > 0) {
                cooldownLeft = remaining;
            }
        }

        long expiresIn = 0;
        if (challenge.getExpiresAt() != null) {
            long remaining = Duration.between(Instant.now(), challenge.getExpiresAt()).getSeconds();
            if (remaining > 0) {
                expiresIn = remaining;
            }
        }

        return new VoiceCallStatusResponse(
                challenge.getId(),
                challenge.getCallStatus(),
                challenge.getVerificationResult(),
                user.getStatus().name(),
                challenge.getTargetContact(),
                challenge.getAttemptCount(),
                challenge.getMaxAttempts(),
                cooldownLeft,
                expiresIn,
                message
        );
    }

    private Optional<RegistrationOtpChallenge> resolveChallenge(UUID challengeId, String callSid) {
        if (challengeId != null) {
            Optional<RegistrationOtpChallenge> opt = otpChallengeRepository.findById(challengeId);
            if (opt.isPresent()) return opt;
        }
        if (callSid != null && !callSid.trim().isEmpty()) {
            return otpChallengeRepository.findByProviderCallId(callSid.trim());
        }
        return Optional.empty();
    }

    private User resolveUser(String email, String phone) {
        if (email != null && !email.trim().isEmpty()) {
            Optional<User> u = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase());
            if (u.isPresent()) return u.get();
        }
        if (phone != null && !phone.trim().isEmpty()) {
            String formatted = formatPhoneNumber(phone.trim());
            Optional<UserProfile> up = userProfileRepository.findByPhone(formatted);
            if (up.isPresent()) return up.get().getUser();

            Optional<UserProfile> upRaw = userProfileRepository.findByPhone(phone.trim());
            if (upRaw.isPresent()) return upRaw.get().getUser();
        }
        return null;
    }

    private void validateWebhookSignature(
            VoiceTelephonyProvider provider,
            String requestUrl,
            Map<String, String> postParams,
            String signatureHeader
    ) {
        if (!verifySignatureEnabled) {
            return;
        }
        if ("MOCK".equalsIgnoreCase(provider.getProviderName())) {
            return;
        }
        boolean valid = provider.verifySignature(requestUrl, postParams, signatureHeader);
        if (!valid) {
            log.warn("[VOICE SECURITY] Telephony provider signature verification failed for URL: {}", requestUrl);
            throw new BadRequestException("Invalid telephony provider webhook signature.");
        }
    }

    private String cleanBaseUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "https://adequate-possibility-production-8080.up.railway.app";
        }
        String trimmed = url.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
