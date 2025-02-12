package com.talktalkcare.domain.users.converter;

import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.entity.UserSecurity;

public class UserSecurityConverter {

    public static UserSecurity toEntity(User user, String salt) {
        return new UserSecurity(
                user.getLoginId(),
                salt
        );
    }

}
