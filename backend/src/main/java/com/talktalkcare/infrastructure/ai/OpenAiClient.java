package com.talktalkcare.infrastructure.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.ai.error.AiErrorCode;
import com.talktalkcare.domain.ai.exception.AiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenAiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.base-url}")
    private String baseUrl;

    @Value("${openai.api.api-key}")
    private String apiKey;

    public String sendRequest(String prompt, String input) {
        try {
            Map<String, Object> requestBody = buildRequest(prompt, input);

            HttpHeaders headers = createHeaders();

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            Map<String,Object> response = sendRequestToOpenAi(requestEntity);

            return extractSummary(response);
        } catch (Exception e) {
            throw new AiException(AiErrorCode.API_COMMUNICATION_FAILURE);
        }
    }

    private Map<String, Object> buildRequest(String prompt, String input) {
        return Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", prompt),
                        Map.of("role", "user", "content", "Input: " + input)
                ),
                "temperature", 0.7
        );
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        return headers;
    }

    private Map<String, Object> sendRequestToOpenAi(HttpEntity<Map<String, Object>> requestEntity) {
        try {
            return restTemplate.postForObject(baseUrl, requestEntity, Map.class);
        } catch (Exception e) {
            throw new AiException(AiErrorCode.API_COMMUNICATION_FAILURE);
        }
    }

    private String extractSummary(Map<String, Object> response) {
        try {
            JsonNode root = objectMapper.valueToTree(response);
            System.out.println("==============");
            System.out.println(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new AiException(AiErrorCode.API_INVALID_RESPONSE);
        }
    }

}