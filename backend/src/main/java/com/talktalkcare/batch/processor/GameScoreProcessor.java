package com.talktalkcare.batch.processor;

import com.talktalkcare.domain.game.dto.GameScoreSummaryDto;
import com.talktalkcare.domain.game.entity.GameCategoryScorePerMonth;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GameScoreProcessor implements ItemProcessor<Object[], GameCategoryScorePerMonth> {

    @Override
    public GameCategoryScorePerMonth process(Object[] row) {
        GameScoreSummaryDto summary = new GameScoreSummaryDto(
                ((Number) row[0]).longValue(),
                (String) row[1],
                ((Number) row[2]).longValue(),
                ((Number) row[3]).doubleValue()
        );

        return new GameCategoryScorePerMonth(
                null,
                summary.getUserId(),
                summary.getDate(),
                summary.getPlayedCount(),
                summary.getMonthScore()
        );
    }
}
