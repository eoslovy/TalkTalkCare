package com.talktalkcare.domain.dementia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "dementia_test")
public class DementiaTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "test_name", nullable = false, length = 20)
    private String testName;

    @NotNull
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

}