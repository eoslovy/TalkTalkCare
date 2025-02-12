package com.talktalkcare.domain.games.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameRecordDto {
    private int userId;
    private int gameId;
    private int score;
}