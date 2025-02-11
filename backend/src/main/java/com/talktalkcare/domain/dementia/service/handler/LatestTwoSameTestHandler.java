package com.talktalkcare.domain.dementia.service.handler;

import com.talktalkcare.domain.ai.dto.AiAnalysisRequest;
import com.talktalkcare.domain.ai.service.AiAnalysisService;
import com.talktalkcare.domain.dementia.dto.TestType;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
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
    public String analyzeTestResults(Integer userId, List<DementiaTestResult> testResults) {
        String prompt = generatePrompt();
        String testResult = generateAnlaysisInput(testResults);
        Integer value = getTestType().getValue();

        AiAnalysisRequest request = AiAnalysisRequest.builder()
                .userId(userId)
                .prompt(prompt)
                .inputData(testResult)
                .analysisType(value)
                .build();

        return aiAnalysisService.analyze(request);
    }

    @Override
    public String generatePrompt() {
        return "You are a dementia diagnosis expert with 20 years of experience. "
                + "Your task is to compare the user's most recent and previous self-assessment dementia test results. "
                + "Identify changes, improvements, and areas of concern, and summarize the findings in **three sentences or less**."
                + "\n\nThe following dementia test questions are part of the assessment:"
                + "\n" + getTestQuestions()
                + "\n\nEach test response consists of 0 (No) or 1 (Yes), where:"
                + "\n- 0 means the respondent answered 'No' to the question."
                + "\n- 1 means the respondent answered 'Yes' to the question."
                + "\n\n**Respond in Korean only. Your response must be written in natural and fluent Korean.**";
    }

    @Override
    public String generateAnlaysisInput(List<DementiaTestResult> testResults) {
        return new StringBuilder()
                .append("Most Recent Test:\n").append(testResults.get(0).getTestResult()).append("\n\n")
                .append("Previous Test:\n").append(testResults.get(1).getTestResult()).append("\n\n")
                .toString();
    }

    private String getTestQuestions() {
        return "1. 기억력에 문제가 있다고 생각하나요?" +
                "2. 기억력이 10년 전보다 나빠졌다고 생각하나요? " +
                "3. 기억력이 같은 또래의 다른 사람들에 비해 나쁘다고 생각하나요? " +
                "4. 기억력 저하로 인해 일상생활에 불편을 느끼나요? " +
                "5. 최근에 일어난 일을 기억하기 어렵나요? " +
                "6. 며칠 전에 나눈 대화 내용을 기억하기 어렵나요? " +
                "7. 며칠 전에 한 약속을 기억하기 어렵나요? " +
                "8. 친한 사람의 이름을 기억하기 어렵나요? " +
                "9. 사용한 물건을 둔 곳을 기억하기 어렵나요? " +
                "10. 이전에 비해 물건을 자주 잃어버리나요? " +
                "11. 집 근처에서 길을 잃은 적이 있나요? " +
                "12. 가게에서 2~3가지 물건을 사려고 할 때 물건 이름을 기억하기 어렵나요? " +
                "13. 가스불이나 전기불 끄는 것을 기억하기 어렵나요? " +
                "14. 자주 사용하는 전화번호(자신 혹은 자녀)를 기억하기 어렵나요?";
    }
}


