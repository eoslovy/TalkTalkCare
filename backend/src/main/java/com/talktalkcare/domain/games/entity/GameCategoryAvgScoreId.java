package com.talktalkcare.domain.games.entity;

import java.io.Serializable;
import java.util.Objects;

public class GameCategoryAvgScoreId implements Serializable {

    private Integer userId;
    private Integer categoryId;

    // 기본 생성자
    public GameCategoryAvgScoreId() {}

    // 생성자
    public GameCategoryAvgScoreId(Integer userId, Integer categoryId) {
        this.userId = userId;
        this.categoryId = categoryId;
    }

    // equals()와 hashCode() 구현
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GameCategoryAvgScoreId that = (GameCategoryAvgScoreId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, categoryId);
    }

    // Getter/Setter 추가
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }
}
