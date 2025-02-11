package com.talktalkcare.domain.ai.service;

import com.talktalkcare.infrastructure.ai.OpenAiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final OpenAiClient openAiClient;

    public String analyze(String prompt, String input) {
        return openAiClient.sendRequest(prompt, input);
    }

}
