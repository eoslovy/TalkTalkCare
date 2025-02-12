package com.talktalkcare.batch.processor;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import com.talktalkcare.domain.games.dto.GameCategoryScoreDto;
import com.talktalkcare.domain.games.entity.GameCategoryAvgScore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameCategoryScoreProcessor implements ItemProcessor<Object[], GameCategoryAvgScore> {

    @Override
    public GameCategoryAvgScore process(Object[] row) {
        try {
            GameCategoryScoreDto summary = new GameCategoryScoreDto(
                    ((Number) row[0]).intValue(),
                    ((Number) row[1]).intValue(),
                    ((Number) row[2]).shortValue(),
                    ((Number) row[3]).floatValue()
            );

            return new GameCategoryAvgScore(
                    summary.getUserId(),
                    summary.getCategoryId(),
                    summary.getPlayedCount(),
                    summary.getAverage()
            );
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.PROCESS_GAME_CATEGORY_SCORE_FAILED);
        }
    }
}
