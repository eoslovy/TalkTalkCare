package com.talktalkcare.batch.job;

import com.talktalkcare.batch.processor.GameScoreProcessor;
import com.talktalkcare.batch.reader.GameScoreReader;
import com.talktalkcare.batch.writer.GameScoreWriter;
import com.talktalkcare.domain.game.entity.GameCategoryScorePerMonth;
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
public class UpdateGameScoreJob {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final GameScoreReader reader;
    private final GameScoreProcessor processor;
    private final GameScoreWriter writer;

    @Bean(name = "gameScoreUpdateJob")
    public Job updateGameScoreJob() {
        return new JobBuilder("updateGameScoreJob", jobRepository)
                .start(updateGameScoreStep())
                .build();
    }

    @Bean(name = "gameScoreUpdateStep")
    public Step updateGameScoreStep() {
        return new StepBuilder("updateGameScoreStep", jobRepository)
                .<Object[], GameCategoryScorePerMonth>chunk(100, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }
}
