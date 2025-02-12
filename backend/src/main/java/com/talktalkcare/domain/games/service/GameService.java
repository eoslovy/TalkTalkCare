package com.talktalkcare.domain.games.service;

import com.talktalkcare.domain.games.dto.GameRecordDto;
import com.talktalkcare.domain.games.entity.GameScorePerDay;
import com.talktalkcare.domain.games.repository.GameRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRecordRepository gameRecordRepository;

    @Transactional
    public GameScorePerDay saveGameResult(GameRecordDto dto) {
        GameScorePerDay result = new GameScorePerDay();
        result.setUserId(dto.getUserId());
        result.setGameId(dto.getGameId());
        result.setScore((short)dto.getScore());
        result.setPlayedAt(LocalDateTime.now());
        
        return gameRecordRepository.save(result);
    }
}
