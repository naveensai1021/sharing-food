package org.sharingfood.service.telephony;

public class VoiceCallResult {
    private final boolean success;
    private final String callSid;
    private final String status;
    private final String providerName;
    private final String errorMessage;

    public VoiceCallResult(boolean success, String callSid, String status, String providerName, String errorMessage) {
        this.success = success;
        this.callSid = callSid;
        this.status = status;
        this.providerName = providerName;
        this.errorMessage = errorMessage;
    }

    public static VoiceCallResult success(String callSid, String status, String providerName) {
        return new VoiceCallResult(true, callSid, status, providerName, null);
    }

    public static VoiceCallResult failure(String providerName, String errorMessage) {
        return new VoiceCallResult(false, null, "FAILED", providerName, errorMessage);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getCallSid() {
        return callSid;
    }

    public String getCallId() {
        return callSid;
    }

    public String getStatus() {
        return status;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getProvider() {
        return providerName;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}

