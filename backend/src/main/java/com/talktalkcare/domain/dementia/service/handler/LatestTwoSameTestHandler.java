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
public class LatestTwoSameTestHandler implements TestTypeHandler {
    private final DementiaRepository dementiaRepository;
    private final AiAnalysisService aiAnalysisService;

    @Override
    public TestType getTestType() {
        return TestType.LATEST_TWO_SAME_TEST;
    }

    @Override
    public List<DementiaTestResult> handleRequest(Integer userId) {
        List<DementiaTestResult> results = dementiaRepository.getLastTwoTestResults(userId);
        return results.size() >= 2 ? results.subList(0, 2) : results;
    }

    @Override
    public String analyzeTestResults(List<DementiaTestResult> testResults) {
        String prompt = DementiaAiRequestType.LATEST_TWO_SAME_TEST.getPrompt();
        String inputData = generateAnlaysisInput(testResults);

        return aiAnalysisService.analyze(prompt, inputData);
    }

    @Override
    public String generateAnlaysisInput(List<DementiaTestResult> testResults) {
        return new StringBuilder()
                .append("Most Recent Test:\n").append(testResults.get(0).getTestResult()).append("\n\n")
                .append("Previous Test:\n").append(testResults.get(1).getTestResult()).append("\n\n")
                .toString();
    }

}


