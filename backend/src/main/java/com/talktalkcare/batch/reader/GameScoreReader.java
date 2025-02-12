package com.talktalkcare.batch.reader;

import com.talktalkcare.batch.error.BatchErrorCode;
import com.talktalkcare.batch.exception.BatchException;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class GameScoreReader extends JpaPagingItemReader<Object[]> {

    private final EntityManagerFactory entityManagerFactory;

    @PostConstruct
    public void init() {
        setName("gameScorePagingReader");
        setEntityManagerFactory(entityManagerFactory);
        setPageSize(100);
        setQueryString("SELECT " +
                "g.userId, " +
                "FUNCTION('DATE_FORMAT', g.playedAt, '%Y-%m'), " +
                "COUNT(g), " +
                "AVG(g.score) " +
                "FROM GameScorePerDay g " +
                "GROUP BY g.userId, FUNCTION('DATE_FORMAT', g.playedAt, '%Y-%m')");

        try {
            afterPropertiesSet();
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.READ_GAME_SCORE_FAILED);
        }
    }
}