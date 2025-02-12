package com.talktalkcare.batch.processor;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import com.talktalkcare.domain.games.dto.GameCategoryScorePerMonthDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameScoreProcessor implements ItemProcessor<Object[], com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth> {

    @Override
    public com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth process(Object[] row) {
        try {
            GameCategoryScorePerMonthDto summary = new GameCategoryScorePerMonthDto(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    ((Number) row[2]).shortValue(),
                    ((Number) row[3]).floatValue()
            );

            com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth result = new com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth(
                    null,
                    summary.getUserId(),
                    summary.getDate(),
                    summary.getPlayedCount(),
                    summary.getMonthScore()
            );
            return result;
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.PROCESS_GAME_SCORE_FAILED);
        }
    }
}
