package com.talktalkcare.domain.games.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GameCategoryScorePerMonthDto implements Serializable {
    private int userId;
    private String date;
    private short playedCount;
    private float monthScore;
}
