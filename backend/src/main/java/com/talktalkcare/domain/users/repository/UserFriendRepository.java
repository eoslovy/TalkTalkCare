package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.UserFriend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFriendRepository extends JpaRepository<UserFriend, Long> {

    @Query("SELECT f.friendId FROM UserFriend f WHERE f.userId = :userId")
    List<Integer> findFriendIdsByUserId(Integer userId);

    @Modifying
    void deleteByUserIdAndFriendId(Integer userId, Integer friendId);

}