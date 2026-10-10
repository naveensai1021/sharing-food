package org.sharingfood.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class OtpSecurityUtil {

    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final SecureRandom secureRandom = new SecureRandom();

    private final SecretKey aesKey;

    public OtpSecurityUtil(@Value("${app.jwt.secret:dGhpcy1pcy1hLXZlcnktc2VjdXJlLWFuZC1sb25nLXNlY3JldC1rZXktZm9yLXNoYXJpbmctZm9vZC1zcHJlYWRpbmctbG92ZS1uZ28tcGxhdGZvcm0=}") String secret) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(secret.getBytes(StandardCharsets.UTF_8));
            this.aesKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize OTP security key", e);
        }
    }

    public String generateSixDigitOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    public String encryptOtp(String plaintextOtp) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, this.aesKey, spec);

            byte[] cipherText = cipher.doFinal(plaintextOtp.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return Base64.getUrlEncoder().withoutPadding().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt OTP", e);
        }
    }

    public String decryptOtp(String encryptedBase64) {
        try {
            byte[] combined = Base64.getUrlDecoder().decode(encryptedBase64);
            if (combined.length <= GCM_IV_LENGTH) {
                return null;
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);

            int cipherLength = combined.length - GCM_IV_LENGTH;
            byte[] cipherText = new byte[cipherLength];
            System.arraycopy(combined, GCM_IV_LENGTH, cipherText, 0, cipherLength);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, this.aesKey, spec);

            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }
}
