package org.sharingfood.service.telephony;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class MockVoiceProvider implements VoiceTelephonyProvider {

    private static final Logger log = LoggerFactory.getLogger(MockVoiceProvider.class);

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public VoiceCallResult initiateOutboundCall(
            String toPhone,
            UUID challengeId,
            String webhookUrl,
            String statusCallbackUrl
    ) {
        String callSid = "MOCK_CALL_" + UUID.randomUUID().toString().substring(0, 8);
        log.info("[MOCK TELEPHONY] Outbound voice call initiated to [{}] for challenge [{}]. CallSid: {}", toPhone, challengeId, callSid);
        log.info("[MOCK TELEPHONY] Script: \"{}\"", VoiceScript.getPromptMessage("en-IN"));
        log.info("[MOCK TELEPHONY] To simulate user input, POST to /api/auth/voice/webhook?challengeId={} with Digits=1 (confirm) or Digits=2 (dispute)", challengeId);
        return VoiceCallResult.success(callSid, "in-progress", "MOCK");
    }

    @Override
    public boolean verifySignature(String fullUrl, Map<String, String> postParams, String signatureHeader) {
        // Mock provider always validates for test runs
        return true;
    }

    @Override
    public String buildGatherTwiML(UUID challengeId, String language, String gatherActionUrl) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Gather numDigits=\"1\" action=\"" + gatherActionUrl + "\" method=\"POST\" timeout=\"10\">\n" +
               "        <Say language=\"" + langCode + "\">" + VoiceScript.getPromptMessage(langCode) + "</Say>\n" +
               "    </Gather>\n" +
               "</Response>";
    }

    @Override
    public String buildConfirmationTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + VoiceScript.getConfirmationMessage(langCode) + "</Say>\n" +
               "</Response>";
    }

    @Override
    public String buildDisputeTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + VoiceScript.getDisputeMessage(langCode) + "</Say>\n" +
               "</Response>";
    }

    @Override
    public String buildTimeoutTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + VoiceScript.getTimeoutMessage(langCode) + "</Say>\n" +
               "</Response>";
    }

    @Override
    public String buildInvalidDigitTwiML(String language) {
        String langCode = VoiceScript.resolveLanguageCode(language);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<Response>\n" +
               "    <Say language=\"" + langCode + "\">" + VoiceScript.getInvalidDigitMessage(langCode) + "</Say>\n" +
               "</Response>";
    }
}
