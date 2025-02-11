package com.talktalkcare.domain.games.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GameCategoryScoreDto implements Serializable {
    private int userId;
    private int categoryId;
    private short playedCount;
    private float average;
}
