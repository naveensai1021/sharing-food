package org.sharingfood.service.telephony;

import java.util.Map;
import java.util.UUID;

public interface VoiceTelephonyProvider {

    String getProviderName();

    boolean isConfigured();

    VoiceCallResult initiateOutboundCall(
            String toPhone,
            UUID challengeId,
            String webhookUrl,
            String statusCallbackUrl
    );

    boolean verifySignature(
            String fullUrl,
            Map<String, String> postParams,
            String signatureHeader
    );

    String buildGatherTwiML(
            UUID challengeId,
            String language,
            String gatherActionUrl
    );

    String buildConfirmationTwiML(String language);

    String buildDisputeTwiML(String language);

    String buildTimeoutTwiML(String language);

    String buildInvalidDigitTwiML(String language);
}
