package com.talktalkcare.domain.call.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CallDto {
    private Integer callerId;
    private Integer receiverId;
    private String receiverPhone;
}
