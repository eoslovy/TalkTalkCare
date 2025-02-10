package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.dto.AddFriendStatusDto;
import com.talktalkcare.domain.users.entity.AddFriendStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AddFriendStatusRepository extends JpaRepository<AddFriendStatus, Integer> {
    AddFriendStatus findByReceiverId(Integer receiverId);
    AddFriendStatus findBySenderId(Integer senderId);

    @Query("SELECT a FROM AddFriendStatus a WHERE a.receiverId = :receiverId")
    List<AddFriendStatusDto> findAddRequestsByReceiverId(Integer receiverId);

    @Query("SELECT a FROM AddFriendStatus a WHERE a.senderId = :senderId")
    List<AddFriendStatusDto> findAddRequestsBySenderId(Integer senderId);
}
