package com.talktalkcare.batch.job;

import com.talktalkcare.batch.processor.GameCategoryScoreProcessor;
import com.talktalkcare.batch.reader.GameCategoryScoreReader;
import com.talktalkcare.batch.writer.GameCategoryScoreWriter;
import com.talktalkcare.domain.games.entity.GameCategoryAvgScore;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class GameCategoryScoreJob {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final GameCategoryScoreReader reader;
    private final GameCategoryScoreProcessor processor;
    private final GameCategoryScoreWriter writer;

    @Bean(name = "gameCategoryScoreUpdateJob")
    public Job updateGameCategoryScoreJob() {
        return new JobBuilder("updateGameCategoryScoreJob", jobRepository)
                .start(updateGameCategoryScoreStep())
                .build();
    }

    @Bean(name = "gameCategoryScoreUpdateStep")
    public Step updateGameCategoryScoreStep() {
        return new StepBuilder("updateGameCategoryScoreStep", jobRepository)
                .<Object[], GameCategoryAvgScore>chunk(100, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }
}
