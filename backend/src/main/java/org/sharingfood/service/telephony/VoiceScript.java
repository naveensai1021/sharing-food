package org.sharingfood.service.telephony;

public class VoiceScript {

    public static final String DEFAULT_LANGUAGE = "en-IN";

    public static String getPromptMessage(String language) {
        if ("te-IN".equalsIgnoreCase(language) || "telugu".equalsIgnoreCase(language)) {
            return "స్ప్రెడ్డింగ్ లవ్ అండ్ స్ప్రెడ్డింగ్ ఫుడ్‌కి స్వాగతం. " +
                   "ఈ మొబైల్ నంబర్‌ని ఉపయోగించి ఖాతాను సృష్టించడానికి మాకు అభ్యర్థన వచ్చింది. " +
                   "మీరు ఈ ఖాతాను సృష్టించినట్లయితే, దయచేసి 1 నొక్కండి. " +
                   "మీరు ఈ ఖాతాను సృష్టించకపోతే, దయచేసి 2 నొక్కండి. ధన్యవాదాలు.";
        }
        if ("hi-IN".equalsIgnoreCase(language) || "hindi".equalsIgnoreCase(language)) {
            return "स्प्रेडिंग लव एंड स्प्रेडिंग फूड में आपका स्वागत है। " +
                   "हमें इस मोबाइल नंबर का उपयोग करके खाता बनाने का अनुरोध प्राप्त हुआ है। " +
                   "यदि आपने यह खाता बनाया है, तो कृपया 1 दबाएं। " +
                   "यदि आपने यह खाता नहीं बनाया है, तो कृपया 2 दबाएं। धन्यवाद।";
        }
        // Exact English script specified in requirements:
        return "Welcome to Spreading Love and Spreading Food. " +
               "We received a request to create an account using this mobile number. " +
               "If you created this account, please press 1. " +
               "If you did not create this account, please press 2. " +
               "Thank you.";
    }

    public static String getConfirmationMessage(String language) {
        if ("te-IN".equalsIgnoreCase(language) || "telugu".equalsIgnoreCase(language)) {
            return "ధన్యవాదాలు. మీ ఖాతా ధృవీకరణ విజయవంతమైంది. అడ్మినిస్ట్రేటర్ మీ దరఖాస్తును సమీక్షిస్తారు. వీడ్కోలు.";
        }
        if ("hi-IN".equalsIgnoreCase(language) || "hindi".equalsIgnoreCase(language)) {
            return "धन्यवाद। आपका खाता सत्यापन सफल रहा। व्यवस्थापक आपके आवेदन की समीक्षा करेंगे। अलविदा।";
        }
        return "Thank you. Your account verification has been confirmed. An administrator will review your application. Goodbye.";
    }

    public static String getDisputeMessage(String language) {
        if ("te-IN".equalsIgnoreCase(language) || "telugu".equalsIgnoreCase(language)) {
            return "ధన్యవాదాలు. మీ వివాదం నమోదు చేయబడింది. ఈ ఖాతా రిజిస్ట్రేషన్ నిరోధించబడింది. వీడ్కోలు.";
        }
        if ("hi-IN".equalsIgnoreCase(language) || "hindi".equalsIgnoreCase(language)) {
            return "धन्यवाद। आपका विवाद दर्ज कर लिया गया है। यह पंजीकरण रोक दिया गया है। अलविदा।";
        }
        return "Thank you. Your dispute has been recorded. This account registration has been blocked. Goodbye.";
    }

    public static String getTimeoutMessage(String language) {
        if ("te-IN".equalsIgnoreCase(language) || "telugu".equalsIgnoreCase(language)) {
            return "మేము ఎటువంటి కీప్యాడ్ ఇన్‌పుట్ అందుకోలేదు. దయచేసి మళ్లీ ప్రయత్నించండి. వీడ్కోలు.";
        }
        if ("hi-IN".equalsIgnoreCase(language) || "hindi".equalsIgnoreCase(language)) {
            return "हमें कोई कीपैड इनपुट प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें। अलविदा।";
        }
        return "We did not receive any keypad input. Please try again. Goodbye.";
    }

    public static String getInvalidDigitMessage(String language) {
        if ("te-IN".equalsIgnoreCase(language) || "telugu".equalsIgnoreCase(language)) {
            return "చెల్లని ఎంపిక. దయచేసి ఖాతాను నిర్ధారించడానికి 1 నొక్కండి, లేదా నిరోధించడానికి 2 నొక్కండి. వీడ్కోలు.";
        }
        if ("hi-IN".equalsIgnoreCase(language) || "hindi".equalsIgnoreCase(language)) {
            return "अमान्य विकल्प। पुष्टि करने के लिए कृपया 1 दबाएं, या विवाद के लिए 2 दबाएं। अलविदा।";
        }
        return "Invalid selection. Please press 1 to confirm your account, or press 2 to dispute. Goodbye.";
    }

    public static String resolveLanguageCode(String requested) {
        if (requested == null) return DEFAULT_LANGUAGE;
        String lower = requested.trim().toLowerCase();
        if (lower.startsWith("te")) return "te-IN";
        if (lower.startsWith("hi")) return "hi-IN";
        return "en-IN";
    }
}
