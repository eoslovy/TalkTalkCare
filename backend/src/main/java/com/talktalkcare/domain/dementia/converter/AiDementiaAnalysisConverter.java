package com.talktalkcare.domain.dementia.converter;

import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;

public class AiDementiaAnalysisConverter {

    public static AiDementiaAnalysis toEntity(Integer userId, String summary, int analysisType, int analysisSeq) {
        return AiDementiaAnalysis.builder()
                .userId(userId)
                .analysisResult(summary)
                .analysisType(analysisType)
                .analysisSequence(analysisSeq)
                .build();
    }

}
