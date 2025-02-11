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
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.base-url}")
    private String baseUrl;

    @Value("${openai.api.api-key}")
    private String apiKey;

    public TalkTalk saveTalkTalk(TalkTalkDto talkTalkDto) {
        TalkTalk talkTalk = new TalkTalk();
        talkTalk.setUserId(talkTalkDto.getUserId());
        talkTalk.setSummary(talkTalkDto.getSummary());

        return talkTalkRepository.save(talkTalk);
    }

    public String getSummary(int userId) {
        String summary = talkTalkRepository.findTalkSummary(userId);
        return summary != null ? summary : "";
    }

    public String talktalkAi(String chat) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "gpt-4o-mini");
            rootNode.put("temperature", 0.7);
            rootNode.put("max_tokens", 100);

            ArrayNode messages = rootNode.putArray("messages");

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

            String requestBody = objectMapper.writeValueAsString(rootNode);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, createHeaders());

            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();
            return parseResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }

    public String summarizeConversation(String conversation) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "gpt-4o-mini");
            rootNode.put("temperature", 0.7);
            rootNode.put("max_tokens", 150);

            ArrayNode messages = rootNode.putArray("messages");

            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "다음은 유저와의 대화 내용이야. 유저 정보를 저장하기 위해 다음 내용을 최대한 간단하게 요약해줘. " +
                            "예를 들어 유저 나이: 72세, 짬뽕 좋아함, 혼자 살고 있음 (이런 식으로)");
            messages.add(systemMessage);

            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", sanitizeInput(conversation));
            messages.add(userMessage);

            String requestBody = objectMapper.writeValueAsString(rootNode);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, createHeaders());

            String response = restTemplate.exchange(baseUrl, HttpMethod.POST, entity, String.class).getBody();
            return parseResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("API 호출 실패: " + e.getMessage());
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        return headers;
    }

    private String parseResponse(String response) throws Exception {
        if (response == null || response.isEmpty()) {
            return "AI 응답없음";
        }
        JsonNode responseJson = objectMapper.readTree(response);
        JsonNode firstChoice = responseJson.path("choices").get(0);
        return firstChoice.path("message").path("content").asText();
    }

    private String sanitizeInput(String input) {
        return input.replaceAll("[\\u0000-\\u001F]", "");
    }
}
