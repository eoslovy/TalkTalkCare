package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;

import java.util.List;

public interface TestTypeHandler {
    TestType getTestType();

    List<DementiaTestResult> handleRequest(Integer userId);

    String analyzeTestResults(Integer userId, List<DementiaTestResult> testResults);

    String generatePrompt();

    String generateAnlaysisInput(List<DementiaTestResult> testResults);
}
