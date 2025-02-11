package com.talktalkcare.domain.dementia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "users_dementia_test_result")
public class DementiaTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id", nullable = false)
    private Integer num;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @NotNull
    @Column(name = "test_id", nullable = false)
    private Integer testId;

    @NotNull
    @Lob
    @Column(name = "test_result", nullable = false)
    private String testResult;

    @NotNull
    @Column(name = "test_date", nullable = false)
    private LocalDateTime testDate;

    public DementiaTestResult(Integer userId, Integer testId, String testResult, LocalDateTime testDate) {
        this.userId=userId;
        this.testId=testId;
        this.testResult=testResult;
        this.testDate=testDate;
    }
}