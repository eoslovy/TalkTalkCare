package com.talktalkcare.domain.ai.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiAnalysisRequest {
    private final Integer userId;
    private final String prompt;
    private final String inputData;
    private final Integer analysisType;
}
