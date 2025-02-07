package com.talktalkcare.domain.users.controller;

import com.talktalkcare.domain.users.dto.FriendDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/friend.status")
    @SendTo("/topic/friends")
    public FriendDto handleFriendStatus(FriendDto friendStatus) {
        return friendStatus;
    }
}
