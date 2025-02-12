package com.talktalkcare.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginReq {

    private String userLoginId;
    private String password;
    private boolean autoLogin;

}
