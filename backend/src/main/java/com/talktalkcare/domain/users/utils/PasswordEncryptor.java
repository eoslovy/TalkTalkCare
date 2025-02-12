package com.talktalkcare.domain.users.utils;

import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import lombok.NoArgsConstructor;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@NoArgsConstructor
public final class PasswordEncryptor {

    public static String encryptPassword(String rawPassword, String salt) {
        byte[] hashedPassword = hashPassword(rawPassword, salt);
        return convertHashToHexString(hashedPassword);
    }

    private static byte[] hashPassword(String rawPassword, String salt) {
        try {
            return generateHash(rawPassword, salt);
        } catch (Exception e) {
            throw new UserException(UserErrorCode.HASH_ALGORITHM_NOT_FOUND);
        }
    }

    private static byte[] generateHash(String rawPassword, String salt) throws NoSuchAlgorithmException {
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        messageDigest.update(rawPassword.getBytes());
        messageDigest.update(salt.getBytes());
        return messageDigest.digest();
    }

    private static String convertHashToHexString(byte[] hashedPassword) {
        return IntStream.range(0, hashedPassword.length)
                .mapToObj(index -> String.format("%02x", hashedPassword[index]))
                .collect(Collectors.joining());
    }
}

