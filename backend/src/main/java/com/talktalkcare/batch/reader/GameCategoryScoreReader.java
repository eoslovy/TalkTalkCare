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
public class GameCategoryScoreReader extends JpaPagingItemReader<Object[]> {

    private final EntityManagerFactory entityManagerFactory;

    @PostConstruct
    public void init() {
        setName("gameCategoryScorePagingReader");
        setEntityManagerFactory(entityManagerFactory);
        setPageSize(100);
        setQueryString("SELECT " +
                "g.userId, " +
                "gl.categoryId, " +
                "COUNT(g), " +
                "AVG(g.score) " +
                "FROM GameScorePerDay g " +
                "JOIN GameList gl ON g.gameId = gl.gameId " +
                "GROUP BY g.userId, gl.categoryId");

        try {
            afterPropertiesSet();
        } catch (Exception e) {
            throw new BatchException(BatchErrorCode.READ_GAME_CATEGORY_SCORE_FAILED);
        }
    }
}
