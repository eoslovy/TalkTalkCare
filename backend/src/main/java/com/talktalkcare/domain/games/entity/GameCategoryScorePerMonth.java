package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "game_category_score_per_month")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameCategoryScorePerMonth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "date", nullable = false)
    private String date; // YYYY-MM 형식

    @Column(name = "played_count", nullable = false)
    private Short playedCount;

    @Column(name = "month_score", nullable = false)
    private Float monthScore;
}

