package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.ai.service.AiAnalysisService;
import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.enums.DementiaAiRequestType;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LatestOneDifferentTestHandler implements TestTypeHandler {
    private final DementiaRepository dementiaRepository;
    private final AiAnalysisService aiAnalysisService;

    @Override
    public TestType getTestType() {
        return TestType.LATEST_ONE_DIFFERENT_TEST;
    }

    @Override
    public List<DementiaTestResult> handleRequest(Integer userId) {
        return dementiaRepository.fetchDifferentTestTypeResults(userId);
    }

    @Override
    public String analyzeTestResults(List<DementiaTestResult> testResults) {
        String prompt = DementiaAiRequestType.LATEST_ONE_DIFFERENT_TEST.getPrompt();
        String inputData = generateAnlaysisInput(testResults);

        return aiAnalysisService.analyze(prompt, inputData);
    }

    public String generateAnlaysisInput(List<DementiaTestResult> testResults) {
        StringBuilder analysisInputText = new StringBuilder();

        for (DementiaTestResult testResult : testResults) {
            analysisInputText.append("Test Type: ").append(testResult.getTestId())
                    .append("\nTest Result: ").append(testResult.getTestResult())
                    .append("\n\n");
        }

        return analysisInputText.toString();
    }

}