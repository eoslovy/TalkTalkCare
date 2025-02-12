package com.talktalkcare.domain.talktalkAI.repository;

import com.talktalkcare.domain.talktalkAI.dto.UserInfoDto;
import com.talktalkcare.domain.talktalkAI.entity.TalkTalk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface TalkTalkRepository extends JpaRepository<TalkTalk, Long> {

    TalkTalk findByUserId(int userId);

    @Query(value = "SELECT talk_summary FROM user_talktalk_log WHERE user_id = :userId", nativeQuery = true)
    String findTalkSummary(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_talktalk_log (user_id, talk_summary) " +
            "VALUES (:userId, :summary) AS new " +
            "ON DUPLICATE KEY UPDATE talk_summary = new.talk_summary",
            nativeQuery = true)
    void UpdateSummary(@Param("userId") int userId, @Param("summary") String summary);

    // login_id를 이용하여 user_id와 name을 반환하는 쿼리
    @Query("SELECT u.userId FROM User u WHERE u.loginId = :loginId")
    Integer findUserId(@Param("loginId") String loginId);
}
