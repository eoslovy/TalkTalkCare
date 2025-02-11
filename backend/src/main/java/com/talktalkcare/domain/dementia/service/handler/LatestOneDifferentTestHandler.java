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
                + "Your task is to analyze the dementia test results and compare self-assessments with caregiver evaluations. "
                + "Summarize the changes, improvements, and critical concerns in **three sentences or less**."
                + "\n\nThe following dementia test questions are included in the assessment:"
                + "\n" + getTestQuestions()
                + "\n\nEach test response consists of 0 (No) or 1 (Yes), where:"
                + "\n- 0 means the respondent answered 'No' to the question."
                + "\n- 1 means the respondent answered 'Yes' to the question."
                + "\n\n**Test Type 1 indicates that the test was conducted as a self-assessment by the user.**"
                + "\n**Test Type 2 indicates that the test was conducted by a caregiver assessing the user.**"
                + "\nIf both types are available, compare them and analyze any discrepancies."
                + "\n\n**Respond in Korean only. Your response must be written in natural and fluent Korean.**";
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

    private String getTestQuestions() {
        return "1. 전화번호나 사람이름을 기억하기 힘들다."+
                "2. 어떤 일이 언제 일어났는지 기억하지 못할 때가 있다. " +
                "3. 며칠 전에 들었던 이야기를 잊는다. " +
                "4. 오래 전부터 들었던 이야기를 잊는다. " +
                "5. 반복되는 일상 생활에 변화가 생겼을 때 금방 적응하기 힘들다. " +
                "6. 본인에게 중요한 사항을 잊을 때가 있다.(배우자 생일, 결혼기념일 등) " +
                "7. 다른 사람에게 같은 이야기를 반복할 때가 있다. " +
                "8. 어떤 일을 해 놓고도 잊어버려 다시 반복할 때가 있다. " +
                "9. 약속을 해 놓고 잊을 때가 있다. " +
                "10. 이야기 도중 방금 자기가 무슨 이야기를 하고 있었는지 잊을 때가 있다. " +
                "11. 약 먹는 시간을 놓치기도 한다. " +
                "12. 여러 가지 물건을 사러 갔다가 한두 가지를 빠뜨리기도 한다. " +
                "13. 가스 불을 끄는 것을 잊어버리거나 음식을 태운 적이 있다. " +
                "14. 남에게 같은 질문을 반복한다. " +
                "15. 어떤 일을 해 놓고도 했는지 안 했는지 몰라 다시 확인해야 한다. " +
                "16. 물건을 두고 다니거나 또는 가지고 갈 물건을 놓고 간다. " +
                "17. 하고 싶은 말이나 표현이 금방 떠오르지 않는다. " +
                "18. 물건 이름이 금방 생각나지 않는다. " +
                "19. 개인적인 편지나 사무적인 편지를 쓰기 힘들다. " +
                "20. 갈수록 말수가 감소되는 경향이 있다. " +
                "21. 신문이나 잡지를 읽을 때 이야기 줄거리를 파악하지 못한다. " +
                "22. 책을 읽을 때 같은 문장을 여러 번 읽어야 이해가 된다. " +
                "23. 텔레비전에 나오는 이야기를 따라가기 힘들다. " +
                "24. 자주 보는 친구나 친척을 바로 알아보지 못한다. " +
                "25. 물건을 어디에 두고 나중에 어디에 두었는지 몰라 찾게 된다. " +
                "26. 전에 가본 장소를 기억하지 못한다. " +
                "27. 방향감각이 떨어졌다. " +
                "28. 길을 잃거나 헤맨 적이 있다. " +
                "29. 물건을 항상 두는 장소를 잊어버리고 엉뚱한 곳을 찾는다. " +
                "30. 계산 능력이 떨어졌다. " +
                "31. 돈 관리를 하는 데 실수가 있다. " +
                "32. 과거에 쓰던 기구 사용이 서툴러졌다. ";
    }

}