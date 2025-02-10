package com.talktalkcare.domain.users.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StatusReq {
    private String type;
    private List<String> friendIds;
}
