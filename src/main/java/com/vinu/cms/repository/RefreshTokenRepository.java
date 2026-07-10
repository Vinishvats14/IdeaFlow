package com.vinu.cms.repository;

import com.vinu.cms.entity.RefreshToken;
import com.vinu.cms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

}