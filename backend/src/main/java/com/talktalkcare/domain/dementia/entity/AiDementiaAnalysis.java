package com.talktalkcare.domain.dementia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "ai_dementia_analysis")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDementiaAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Lob
    @Column(name = "analysis_result", columnDefinition = "TEXT", nullable = false)
    private String analysisResult;

    @NotNull
    @Column(name = "analysis_type", nullable = false)
    private int analysisType;

    @NotNull
    @Column(name = "analysis_sequence", nullable = false)
    private Integer analysisSequence;

}