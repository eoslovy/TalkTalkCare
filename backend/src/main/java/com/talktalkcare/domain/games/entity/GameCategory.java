package com.talktalkcare.domain.games.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "game_category")
public class GameCategory {
    @Id
    @Column(name = "game_id", nullable = false)
    private Integer gameId;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Size(max = 50)
    @NotNull
    @Column(name = "category", nullable = false, length = 50)
    private String category;

}