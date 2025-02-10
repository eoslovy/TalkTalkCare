package com.talktalkcare.batch.writer;

import com.talktalkcare.domain.game.entity.GameCategoryScorePerMonth;
import com.talktalkcare.domain.game.repository.GameCategoryScorePerMonthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GameScoreWriter implements ItemWriter<GameCategoryScorePerMonth> {

    private final GameCategoryScorePerMonthRepository repository;

    @Override
    public void write(Chunk<? extends GameCategoryScorePerMonth> items) {
        repository.saveAll(items);
    }
}
