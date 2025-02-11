package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.converter.TestResultConverter;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import com.talktalkcare.domain.dementia.repository.DementiaRepository;
import com.talktalkcare.domain.dementia.service.handler.TestTypeHandler;
import com.talktalkcare.domain.dementia.service.handler.TestTypeHandlerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DementiaService {

    private final DementiaRepository dementiaRepository;
    private final TestTypeHandlerFactory testTypeHandlerFactory;

    @Transactional
    public void saveTestResult(DementiaTestDto dementiaTestDto) {
        DementiaTestResult testResult = TestResultConverter.dtoToEntity(dementiaTestDto);

        dementiaRepository.save(testResult);
    }

    public String generateAiTestAnalysis(Integer userId, int testType) {
        TestType type = TestType.fromValue(testType);
        TestTypeHandler handler = testTypeHandlerFactory.getHandler(type);

        List<DementiaTestResult> testResults = handler.handleRequest(userId);

        if(testResults.size() < 2)
            throw new DementiaTestException(DementiaTestErrorCode.NOT_ENOUGH_TEST_RESULTS);

        return handler.analyzeTestResults(userId, testResults);
    }

}
