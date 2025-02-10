package com.talktalkcare.domain.talktalkAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.repository.TalkTalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TalkTalkService {

    private final TalkTalkRepository talkTalkRepository;

    private final RestTemplate restTemplate;

    @Value("https://api.deepseek.com/chat/completions")
    private String baseUrl;

    @Value("${deepseek.api.api-key}")
    private String apiKey;

    public int getUserInfo(String loginId) {
        return talkTalkRepository.findUserId(loginId);
    }

    public TalkTalk saveTalkTalk(TalkTalkDto talkTalkDto) {
        TalkTalk talkTalk = new TalkTalk();
        talkTalk.setUserId(talkTalkDto.getUserId());
        talkTalk.setSummary(talkTalkDto.getSummary());
        System.out.println(talkTalk);
        return talkTalkRepository.save(talkTalk);
    }
    public String getSummary(int userId) {
        String summary = talkTalkRepository.findTalkSummary(userId);
        System.out.println("summary:"+summary);
        if (summary != null) {
            return summary; // Return the summary if found
        } else {
            return " "; // Return a default message if not found
        }
    }
    public String talktalkAi(String chat) {
        ObjectMapper objectMapper = new ObjectMapper();
        System.out.println("chat:"+chat);
        try {
            // JSON 객체 생성
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            // messages 배열 생성
            ArrayNode messages = rootNode.putArray("messages");

            // "system" 메시지 추가
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "다음은 유저의 성향 및 특징이야. 이를 기반으로 대화를 이어나갈 수 있게 두 문장 이내로 보내줘"
            );
            messages.add(systemMessage);
            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(chat));
            messages.add(userMessage);

            // JSON 문자열로 변환
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // HTTP 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // HTTP 요청 객체 생성
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            System.out.println("APi 호출");
            // API 호출
            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();
            System.out.println("response:"+response);
            // 응답이 null인지 확인
            if (response == null || response.isEmpty()) {
                System.out.println("DeepSeek API Response is null or empty.");
                return "AI 응답 없음"; // 기본 응답 메시지 설정
            }

            // JSON 파싱
            JsonNode responseJson = objectMapper.readTree(response);

            // 응답 구조 검증
            JsonNode firstChoice = responseJson.get("choices").get(0);

            // content 추출
            String content = firstChoice.get("message").get("content").asText();

            // content 출력
//            System.out.println(content);

            return content;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }

    private String sanitizeInput(String input) {
        return input.replaceAll("[\\u0000-\\u001F]", ""); // 제어 문자 제거
    }

    public String summarizeConversation(String conversation) {
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // JSON 객체 생성
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "deepseek-chat");
            rootNode.put("stream", false);

            // messages 배열 생성
            ArrayNode messages = rootNode.putArray("messages");

            // "system" 메시지 추가
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "다음은 유저와의 대화 내용이야. 유저 정보를 저장하기 위해 다음 내용을 최대한 간단하게 요약해줘. " +
                            "예를 들어 유저 나이: 72세, 짬뽕 좋아함, 혼자 살고 있음 (이런 식으로)");
            messages.add(systemMessage);

            // "user" 메시지 추가
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(conversation));
            messages.add(userMessage);

            // JSON 문자열로 변환
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // HTTP 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // HTTP 요청 객체 생성
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();

            // 응답이 비어 있는 경우 예외 처리
            if (response == null || response.isEmpty()) {
                throw new RuntimeException("API 호출 실패");
            }

            // JSON 파싱
            JsonNode responseJson = objectMapper.readTree(response);

            // 응답 로그 출력 (디버깅 용도)
            System.out.println("API 응답: " + responseJson.toPrettyString());

            // "choices" 배열이 존재하는지 확인
            if (!responseJson.has("choices") || responseJson.get("choices").isEmpty()) {
                throw new RuntimeException("API 응답에 'choices' 필드가 없습니다.");
            }

            // 첫 번째 choice 가져오기
            JsonNode firstChoice = responseJson.get("choices").get(0);

            // 요약된 내용 추출
            String content = firstChoice.get("message").get("content").asText();

            // 결과 로그 출력
            System.out.println("요약 결과: " + content);

            return content;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }
}
