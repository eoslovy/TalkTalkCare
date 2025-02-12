package com.talktalkcare.domain.talktalkAI.controller;

import com.talktalkcare.common.response.Api;
import com.talktalkcare.domain.talktalkAI.dto.TalkTalkDto;
import com.talktalkcare.domain.talktalkAI.service.TalkTalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/talktalk")
public class TalkTalkController {

    private final TalkTalkService talkTalkService;

    @PostMapping("/start")
    public Api<Void> initializeConversation (@RequestParam Integer userId) {
        talkTalkService.initializeConversation(userId);
        return Api.OK();
    }

    @GetMapping("/chat")
    public Api<String> getAiResponse(@RequestParam Integer userId,
                                       @RequestParam String response) {
        String aiResponse = talkTalkService.getAiResponse(userId, response);
        return Api.OK(aiResponse);
    }

    @PostMapping("/end")
    public Api<Void> saveTalkTalk(@RequestParam Integer userId) {
        talkTalkService.saveConversation(userId);
        return Api.OK();
    }
}
