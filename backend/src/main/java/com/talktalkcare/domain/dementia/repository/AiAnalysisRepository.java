package com.talktalkcare.domain.dementia.repository;

import com.talktalkcare.domain.dementia.entity.AiDementiaAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiDementiaAnalysis, Long> {

    // 특정 userId의 analysisType 기준으로 가장 높은 analysisSequence 가져오기
    @Query("SELECT COALESCE(MAX(a.analysisSequence), 0) FROM AiDementiaAnalysis a WHERE a.userId = :userId AND a.analysisType = :analysisType")
    int findMaxAnalysisSequenceByUserId(@Param("userId") int userId, @Param("analysisType") int analysisType);

    @Query("SELECT a FROM AiDementiaAnalysis a WHERE a.userId = :userId AND a.analysisType = :analysisType ORDER BY a.analysisSequence DESC LIMIT 1")
    Optional<AiDementiaAnalysis> findLatestAnalysis(
            @Param("userId") Integer userId,
            @Param("analysisType") int analysisType
    );
}
