package com.talktalkcare.domain.users.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.users.dto.SmsDto;
import com.talktalkcare.domain.users.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sms/")
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send")
    public Api<Void> sendMessage(@RequestBody SmsDto smsDto) {
        smsService.sendMessage(smsDto.getPhoneNumber());
        return Api.OK();
    }

    @PostMapping("/verify")
    public Api<Void> verifyCode(@RequestBody SmsDto smsDto) {
        smsService.verifyCode(smsDto.getPhoneNumber(), smsDto.getVerificationCode());
        return Api.OK();
    }
}
