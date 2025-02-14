package com.talktalkcare.domain.call.service;

import com.talktalkcare.domain.call.dto.CallDto;
import com.talktalkcare.domain.call.dto.CallInvitationDto;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import com.talktalkcare.domain.users.service.FriendService;
import com.talktalkcare.domain.users.service.UserService;
import com.talktalkcare.domain.users.service.UserStatusWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CallService {

    private final UserService userService;
    private final UserStatusWebSocketHandler userStatusWebSocketHandler;

    public void callFriend(CallDto callDto) {
        Integer callerId = callDto.getCallerId();
        User caller = userService.getUserById(callerId);

        String receiverPhone = callDto.getReceiverPhone();
        User receiver = userService.getUserIdByPhone(receiverPhone);

        // isUserOnline 체크 로직 필요

        CallInvitationDto invitation = new CallInvitationDto();
        invitation.setCallerId(callerId);
        invitation.setCallerName(caller.getName());
        invitation.setReceiverName(receiver.getName());
        invitation.setMessage("화상통화 요청이 도착했습니다.");

        userStatusWebSocketHandler.sendNotification(receiver, invitation);
    }

}
