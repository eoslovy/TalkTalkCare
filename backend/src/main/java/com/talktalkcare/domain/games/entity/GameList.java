package com.talktalkcare.domain.games.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "game_list")
public class GameList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_id", nullable = false)
    private Integer gameId;

    @NotNull
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Size(max = 255)
    @NotNull
    @Column(name = "game_name", nullable = false)
    private String gameName;

}