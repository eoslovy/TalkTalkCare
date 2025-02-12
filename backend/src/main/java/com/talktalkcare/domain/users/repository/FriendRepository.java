package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    @Query("SELECT f.userId FROM Friend f WHERE f.friendId = :userId")
    List<Integer> findFriendIdsByUserId(Integer userId);

    @Modifying
    void deleteByUserIdAndFriendId(Integer userId, Integer friendId);

}