package com.talktalkcare.domain.ai.service;

import com.talktalkcare.domain.ai.dto.AiAnalysisRequest;
import com.talktalkcare.infrastructure.ai.OpenAiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final OpenAiClient openAiClient;

    public String analyze(AiAnalysisRequest request) {
        String responseSummary = openAiClient.sendRequest(request.getPrompt(), request.getInputData());
        return responseSummary;
    }

}
