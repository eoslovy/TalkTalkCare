package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.GameCategoryScorePerMonth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameCategoryScorePerMonthRepository extends JpaRepository<GameCategoryScorePerMonth, Long> {

}
