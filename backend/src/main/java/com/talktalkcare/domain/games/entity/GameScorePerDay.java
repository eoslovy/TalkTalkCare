package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_score_per_day")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameScorePerDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "game_id", nullable = false)
    private Integer gameId;

    @Column(name = "score", nullable = false)
    private Short score;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;
}

