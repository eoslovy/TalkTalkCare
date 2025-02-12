package com.talktalkcare.domain.talktalkAI.model;

public class ConversationHistory {

    private final StringBuilder history;

    public ConversationHistory() {
        this.history = new StringBuilder();
    }

    public ConversationHistory(String initialSummary) {
        this();
        this.history.append("이전 대화 요약 : ").append(initialSummary).append("\n");
    }

    public void appendUserMessage(String userMessage) {
        history.append("유저: ").append(userMessage).append("\n");
    }

    public void appendAiMessage(String aiMessage) {
        history.append("AI : ").append(aiMessage).append("\n");
    }

    public String getFullHistory() {
        return history.toString();
    }

}
