package com.talktalkcare.batch.writer;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import com.talktalkcare.domain.games.entity.GameCategoryAvgScore;
import com.talktalkcare.domain.games.repository.GameCategoryAvgScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameCategoryScoreWriter implements ItemWriter<GameCategoryAvgScore> {

    private final GameCategoryAvgScoreRepository repository;

    @Override
    public void write(Chunk<? extends GameCategoryAvgScore> items) {
        try {
            for (GameCategoryAvgScore item : items) {
                repository.deleteByUserIdAndCategoryId(
                        item.getUserId().intValue(),
                        item.getCategoryId().intValue()
                );
                repository.save(item);
            }
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.WRITE_GAME_CATEGORY_SCORE_FAILED);
        }
    }
}
