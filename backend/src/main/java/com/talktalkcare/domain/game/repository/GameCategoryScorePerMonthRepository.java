package com.talktalkcare.domain.game.repository;

import com.talktalkcare.domain.game.entity.GameCategoryScorePerMonth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameCategoryScorePerMonthRepository extends JpaRepository<GameCategoryScorePerMonth, Long> {

}
