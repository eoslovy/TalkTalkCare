package com.talktalkcare.domain.game.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_score_per_day")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameScorePerDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "game_id", nullable = false)
    private Long gameId;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;
}

