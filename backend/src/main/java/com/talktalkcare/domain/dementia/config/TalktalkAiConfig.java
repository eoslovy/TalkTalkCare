package com.talktalkcare.domain.dementia.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class TalktalkAiConfig {
    //    @Value("${openai.api.key}")
//    private String openAiKey;
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
