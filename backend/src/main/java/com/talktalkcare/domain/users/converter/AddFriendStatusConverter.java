package com.talktalkcare.domain.users.converter;

import com.talktalkcare.domain.users.dto.AddFriendStatusDto;
import com.talktalkcare.domain.users.entity.AddFriendStatus;

public class AddFriendStatusConverter {

    public static AddFriendStatus toEntity(AddFriendStatusDto dto) {
        return new AddFriendStatus(
                dto.getReceiverId(),
                dto.getSenderId(),
                dto.getStatus()
        );
    }

}
