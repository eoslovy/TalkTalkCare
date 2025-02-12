package com.talktalkcare.domain.dementia.repository;
import com.talktalkcare.domain.dementia.entity.DementiaTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

//테스트가 1,과 2인 칼럼의 최신 test_date를 가진 결과 두개를 userid 기반
public interface DementiaRepository extends JpaRepository<DementiaTestResult, Long> {
    ;
    @Query("SELECT d FROM DementiaTestResult d " +
            "WHERE d.userId = :userId AND d.testId IN (1, 2) " +
            "AND d.testDate = (SELECT MAX(d2.testDate) FROM DementiaTestResult d2 WHERE d2.userId = :userId AND d2.testId = d.testId)")
    List<DementiaTestResult> fetchDifferentTestTypeResults(@Param("userId") int userId);

    // 테스트 ID가 1이고, 가장 최신 test_date를 가진 두 개의 결과 조회
    @Query("SELECT d FROM DementiaTestResult d WHERE d.testId = 1 AND d.userId = :userId " +
            "ORDER BY d.testDate DESC")
    List<DementiaTestResult> getLastTwoTestResults(@Param("userId") int userId);
}