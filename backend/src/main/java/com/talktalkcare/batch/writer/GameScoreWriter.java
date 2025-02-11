package com.talktalkcare.batch.writer;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth;
import com.talktalkcare.domain.games.repository.GameCategoryScorePerMonthRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameScoreWriter implements ItemWriter<GameCategoryScorePerMonth> {

    private final GameCategoryScorePerMonthRepository repository;

    @Override
    @Transactional
    public void write(Chunk<? extends GameCategoryScorePerMonth> items) {
        try {
            repository.saveAll(items);
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.WRITE_GAME_SCORE_FAILED);
        }
    }
}
