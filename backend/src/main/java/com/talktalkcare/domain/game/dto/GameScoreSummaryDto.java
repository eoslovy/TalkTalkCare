package com.talktalkcare.domain.game.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@NoArgsConstructor
public class GameScoreSummaryDto implements Serializable {
    private Long userId;
    private String date;
    private Integer playedCount;
    private Float monthScore;

    public GameScoreSummaryDto(Long userId, String date, Long count, Double avgScore) {
        this.userId = userId;
        this.date = date;
        this.playedCount = count.intValue();
        this.monthScore = avgScore.floatValue();
    }

    public Integer getPlayedCount() {
        return playedCount.intValue();
    }

    public Float getMonthScore() {
        return monthScore.floatValue();
    }
}
