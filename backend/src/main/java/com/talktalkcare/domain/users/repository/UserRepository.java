package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.User;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    @Modifying
    @Query("update User user  set user.loginedAt=now() where user.userId = :userId")
    void setUserLoginedAt(Integer userId);

    Optional<User> findByPhone(@NotNull String phone);
}

