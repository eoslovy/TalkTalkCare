package com.talktalkcare.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResp {

    private Integer userId;

    private String username;

    private String s3Filename;

}
