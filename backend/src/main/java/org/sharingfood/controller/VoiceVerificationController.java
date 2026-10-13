package org.sharingfood.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.sharingfood.dto.VoiceCallRetryRequest;
import org.sharingfood.dto.VoiceCallStartRequest;
import org.sharingfood.dto.VoiceCallStatusResponse;
import org.sharingfood.service.VoiceVerificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/voice")
public class VoiceVerificationController {

    private static final Logger log = LoggerFactory.getLogger(VoiceVerificationController.class);

    private final VoiceVerificationService voiceVerificationService;

    public VoiceVerificationController(VoiceVerificationService voiceVerificationService) {
        this.voiceVerificationService = voiceVerificationService;
    }

    /**
     * Starts an automated voice call verification session.
     */
    @PostMapping("/start")
    public ResponseEntity<VoiceCallStatusResponse> startVoiceVerification(
            @RequestBody VoiceCallStartRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("[API] Request to start voice verification for email [{}] / phone [{}]", request.getEmail(), request.getPhone());
        VoiceCallStatusResponse response = voiceVerificationService.startVoiceVerification(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Retries an automated voice call verification session subject to cooldown.
     */
    @PostMapping("/retry")
    public ResponseEntity<VoiceCallStatusResponse> retryVoiceVerification(
            @RequestBody VoiceCallRetryRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("[API] Request to retry voice verification for challenge [{}] / email [{}]", request.getChallengeId(), request.getEmail());
        VoiceCallStatusResponse response = voiceVerificationService.retryVoiceVerification(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves current verification status for the registration session.
     */
    @GetMapping("/status")
    public ResponseEntity<VoiceCallStatusResponse> getVoiceVerificationStatus(
            @RequestParam(value = "challengeId", required = false) UUID challengeId,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone
    ) {
        VoiceCallStatusResponse response = voiceVerificationService.getVoiceCallStatus(challengeId, email, phone);
        return ResponseEntity.ok(response);
    }

    /**
     * Provider Webhook: Called when the outbound call connects. Returns Gather TwiML.
     */
    @PostMapping(value = "/webhook", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> handleCallWebhook(
            @RequestParam(value = "challengeId", required = false) UUID challengeId,
            @RequestParam(value = "lang", required = false) String language,
            @RequestParam Map<String, String> postParams,
            @RequestHeader(value = "X-Twilio-Signature", required = false) String signatureHeader,
            HttpServletRequest request
    ) {
        String requestUrl = reconstructRequestUrl(request);
        log.info("[API] Received provider call webhook for challenge [{}]. CallSid: {}", challengeId, postParams.get("CallSid"));
        String twiml = voiceVerificationService.handleInitialCallWebhook(challengeId, language, postParams, signatureHeader, requestUrl);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(twiml);
    }

    /**
     * Provider Webhook: Captures DTMF keypad input (Press 1 = Confirm, Press 2 = Dispute).
     */
    @PostMapping(value = "/gather", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> handleGatherWebhook(
            @RequestParam(value = "challengeId", required = false) UUID challengeId,
            @RequestParam(value = "lang", required = false) String language,
            @RequestParam Map<String, String> postParams,
            @RequestHeader(value = "X-Twilio-Signature", required = false) String signatureHeader,
            HttpServletRequest request
    ) {
        String requestUrl = reconstructRequestUrl(request);
        log.info("[API] Received provider gather webhook for challenge [{}]. Digits: {}", challengeId, postParams.get("Digits"));
        String twiml = voiceVerificationService.handleGatherWebhook(challengeId, language, postParams, signatureHeader, requestUrl);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(twiml);
    }

    /**
     * Provider Status Callback: Receives call status transitions (completed, busy, no-answer).
     */
    @PostMapping("/status-callback")
    public ResponseEntity<Void> handleStatusCallback(
            @RequestParam(value = "challengeId", required = false) UUID challengeId,
            @RequestParam Map<String, String> postParams,
            @RequestHeader(value = "X-Twilio-Signature", required = false) String signatureHeader,
            HttpServletRequest request
    ) {
        String requestUrl = reconstructRequestUrl(request);
        voiceVerificationService.handleStatusCallback(challengeId, postParams, signatureHeader, requestUrl);
        return ResponseEntity.ok().build();
    }

    private String reconstructRequestUrl(HttpServletRequest request) {
        StringBuffer url = request.getRequestURL();
        String query = request.getQueryString();
        if (query != null && !query.isEmpty()) {
            url.append('?').append(query);
        }
        return url.toString();
    }
}
