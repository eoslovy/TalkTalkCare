package com.talktalkcare.domain.games.repository;

import com.talktalkcare.domain.games.entity.GameScorePerDay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRecordRepository extends JpaRepository<GameScorePerDay, Long> {

}
