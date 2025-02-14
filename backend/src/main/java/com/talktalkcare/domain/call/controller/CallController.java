package com.talktalkcare.domain.call.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.call.dto.CallDto;
import com.talktalkcare.domain.call.dto.CallInvitationDto;
import com.talktalkcare.domain.call.service.CallService;
import com.talktalkcare.domain.users.dto.FriendDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/call")
public class CallController {

    private final CallService callService;

    @PostMapping("/request")
    public Api<Void> callFriend(@RequestBody CallDto callDto) {
        callService.callFriend(callDto);

        return Api.OK();
    }

}
