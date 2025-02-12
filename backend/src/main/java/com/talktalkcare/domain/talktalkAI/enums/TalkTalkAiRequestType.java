package com.talktalkcare.domain.talktalkAI.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TalkTalkAiRequestType {
    CHAT_RESPONSE("You are a warm, kind, and friendly chatbot engaging in real-time conversations with the user. "
            + "Based on the provided conversation history, analyze the user's personality and preferences to tailor your responses naturally. "
            + "Respond in Korean within two sentences."),
    SUMMARY_CONVERSATION("Summarize the current conversation in detail to store in the database, ensuring it captures the user's personality, past activities, and key discussion points. "
            + "Update any overlapping information with the latest details. "
            + "The summary should be concise, with no more than three sentences, while preserving the essential characteristics and context of the conversation. "
            + "If relevant, include additional insights that might help personalize future interactions. "
            + "Additionally, suggest and include any useful details that could enhance the chatbot's understanding of the user, such as their emotional state, frequently discussed topics, preferred response style, and connections to past conversations. "
            + "Respond in Korean.");

    private final String prompt;
}