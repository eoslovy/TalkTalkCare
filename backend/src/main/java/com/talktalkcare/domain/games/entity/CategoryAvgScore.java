package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "game_category_avg_score")
@IdClass(CategoryAvgScoreId.class)  // 복합 기본키 클래스를 지정
public class CategoryAvgScore {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Id
    @Column(name = "category_id")
    private Integer categoryId;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "played_count", nullable = false)
    private Short playedCount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "average", nullable = false)
    private Float average;

}