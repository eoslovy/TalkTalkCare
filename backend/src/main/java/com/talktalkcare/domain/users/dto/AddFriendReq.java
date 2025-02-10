package com.talktalkcare.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddFriendReq {

    private Integer userId;

    private String name;

    private String phone;

}
