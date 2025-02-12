package com.talktalkcare.domain.dementia.service;

import com.talktalkcare.domain.dementia.converter.TestResultConverter;
import com.talktalkcare.domain.dementia.dto.DementiaTestDto;
import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import com.talktalkcare.domain.dementia.error.DementiaTestErrorCode;
import com.talktalkcare.domain.dementia.exception.DementiaTestException;
import com.talktalkcare.domain.dementia.repository.AiAnalysisRepository;
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

    private final AiAnalysisRepository analysisRepository;
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

        return handler.analyzeTestResults(testResults);
    }
    public String getAiTestAnalysis(Integer userId, int testType) {
        return analysisRepository.findLatestAnalysis(userId, testType)
                .map(AiDementiaAnalysis::getAnalysisResult) // 최신 분석 결과가 존재하면 반환
                .orElseGet(() -> { // 결과가 없으면 generateAiTestAnalysis 실행 후 다시 가져오기
                    String newAnalysis = generateAiTestAnalysis(userId, testType);
                    System.out.println(newAnalysis);
                    return newAnalysis;
                });
    }

}
