package com.talktalkcare.domain.dementia.converter;

import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;

import java.time.LocalDateTime;

public class TestResultConverter {

    public static DementiaTestResult dtoToEntity(DementiaTestDto dementiaTestDto) {
        return new DementiaTestResult(
                dementiaTestDto.getUserId(),
                dementiaTestDto.getTestId(),
                dementiaTestDto.getTestResult(),
                LocalDateTime.now()
        );
    }

}
