package com.talktalkcare.domain.talktalkAI.service;

import com.talktalkcare.domain.ai.service.AiAnalysisService;
import com.talktalkcare.domain.talktalkAI.converter.TalkTalkConverter;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import com.talktalkcare.domain.talktalkAI.enums.TalkTalkAiRequestType;
import com.talktalkcare.domain.talktalkAI.model.ConversationHistory;
import com.talktalkcare.domain.talktalkAI.repository.TalkTalkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TalkTalkService {

    private final TalkTalkRepository talkTalkRepository;
    private final AiAnalysisService aiAnalysisService;
    private final Map<Integer, ConversationHistory> userConversations = new ConcurrentHashMap<>();

    public String initializeConversation(Integer userId) {
        String summary = talkTalkRepository.findTalkSummary(userId);

        if(summary == null) {
            summary = "";
        }

        storeConversationHistory(userId, summary);

        return summary;
    }

    private void storeConversationHistory(Integer userId, String summary) {
        userConversations.put(userId, new ConversationHistory(summary));
    }

    public String getAiResponse(Integer userId, String userResponse) {
        ConversationHistory history = userConversations.get(userId);
        history.appendUserMessage(userResponse);

        String prompt = TalkTalkAiRequestType.CHAT_RESPONSE.getPrompt();
        String aiResponse = aiAnalysisService.analyze(prompt, history.getFullHistory());

        history.appendAiMessage(aiResponse);

        return aiResponse;
    }

    public void saveConversation(Integer userId) {
        String conversationHistory = userConversations.get(userId).getFullHistory();

        String prompt = TalkTalkAiRequestType.CHAT_RESPONSE.getPrompt();
        String aiResponse = aiAnalysisService.analyze(prompt, conversationHistory);

        TalkTalk entity = TalkTalkConverter.toEntity(userId, aiResponse);

        talkTalkRepository.save(entity);

        userConversations.remove(userId);
    }

}
