package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import com.talktalkcare.domain.users.repository.UserRepository;
import com.talktalkcare.infrastructure.repository.RedisRepository;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class SmsService {

    @Value("${spring.sms.sender}")
    private String smsSender;

    private final DefaultMessageService messageService;
    private final RedisRepository redisRepository;
    private final UserRepository userRepository;

    public void sendMessage(String to) {
        if(userRepository.existsByPhone(to)) {
            throw new UserException(UserErrorCode.USER_ALREADY_EXISTS);
        }

        String verificationCode = generateVerificationCode();

        Message message = new Message();
        message.setFrom(smsSender);
        message.setTo(to);
        message.setText("[톡톡케어]인증번호는 "+verificationCode+"입니다.");

        messageService.sendOne(new SingleMessageSendingRequest(message));

        redisRepository.save(to, verificationCode, 5);
    }

    private String generateVerificationCode() {
        SecureRandom randomGenerator = new SecureRandom();
        int randomSixDigitNumber = 100000 + randomGenerator.nextInt(900000);

        return String.valueOf(randomSixDigitNumber);
    }

    public void verifyCode(String phoneNumber, String verificationCode) {
        String storedCode = getStoredCode(phoneNumber);
        validateCodeMatch(storedCode, verificationCode);

        redisRepository.delete(phoneNumber);
    }

    private String getStoredCode(String phoneNumber) {
        String storedCode = (String) redisRepository.find(phoneNumber);

        if(storedCode==null) {
            throw new UserException(UserErrorCode.USER_OTP_EXPIRED);
        }

        return storedCode;
    }

    private void validateCodeMatch(String storedCode, String inputCode) {
        if(!storedCode.equals(inputCode)) {
            throw new UserException(UserErrorCode.USER_OTP_MISMATCH);
        }
    }

}
