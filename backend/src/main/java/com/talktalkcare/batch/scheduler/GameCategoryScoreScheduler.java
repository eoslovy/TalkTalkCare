package com.talktalkcare.batch.scheduler;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GameCategoryScoreScheduler {

    private final JobLauncher jobLauncher;
    private final Job updateGameCategoryScoreJob;

    public GameCategoryScoreScheduler(
        JobLauncher jobLauncher,
        @Qualifier("gameCategoryScoreUpdateJob") Job updateGameCategoryScoreJob
    ) {
        this.jobLauncher = jobLauncher;
        this.updateGameCategoryScoreJob = updateGameCategoryScoreJob;
    }

//    @Scheduled(cron = "0 0 0 1 * ?") // 매월 1일 00:00 실행
    @Scheduled(cron = "0 0/1 * * * ?") // 매 1분마다 실행 (테스트용)
    public void runBatchJob() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("time", String.valueOf(System.currentTimeMillis()))
                    .toJobParameters();

            jobLauncher.run(updateGameCategoryScoreJob, jobParameters);
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.CATEGORY_BATCH_JOB_EXECUTION_FAILED);
        }
    }
}
