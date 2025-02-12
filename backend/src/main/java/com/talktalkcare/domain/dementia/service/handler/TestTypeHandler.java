package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;

import java.util.List;

public interface TestTypeHandler {
    TestType getTestType();

    List<DementiaTestResult> handleRequest(Integer userId);

    String analyzeTestResults(List<DementiaTestResult> testResults);

    String generateAnlaysisInput(List<DementiaTestResult> testResults);
}
