package com.talktalkcare.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AddFriendStatusDto {

    private Integer receiverId;

    private Integer senderId;

    private String status = "WAITING";

}
