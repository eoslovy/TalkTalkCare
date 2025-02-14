package com.talktalkcare.domain.call.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CallInvitationDto {
    private Integer callerId;
    private String callerName;
    private Integer receiverId;
    private String receiverName;
    private String message;
    private String openviduSessionId;
}
