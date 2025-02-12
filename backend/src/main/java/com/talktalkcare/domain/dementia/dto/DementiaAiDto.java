package com.talktalkcare.domain.dementia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DementiaAiDto {
    private int userId;
    private String summary;
    private int analysisType;
    private int analysisSeq;

}