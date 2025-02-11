package com.talktalkcare.domain.talktalkAI.converter;

import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;

public class TalkTalkConverter {

    public static TalkTalk toEntity(Integer userId, String summary) {
        return TalkTalk.builder()
                .userId(userId)
                .summary(summary)
                .build();
    }
}
