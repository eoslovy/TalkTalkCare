package com.talktalkcare.domain.users.converter;

import com.talktalkcare.domain.users.dto.UserDto;
import com.talktalkcare.domain.users.entity.User;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class UserConverter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static User dtoToEntity(UserDto userDto, String encryptedPassword) {
        return new User(
                userDto.getLoginId(),
                encryptedPassword,
                userDto.getName(),
                LocalDate.parse(userDto.getBirth(), DATE_FORMATTER),
                userDto.getPhone()
        );
    }

}
