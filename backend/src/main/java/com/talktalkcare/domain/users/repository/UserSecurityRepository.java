package com.talktalkcare.domain.users.repository;

import com.talktalkcare.domain.users.entity.UserSecurity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSecurityRepository extends JpaRepository<UserSecurity, String> {

}
