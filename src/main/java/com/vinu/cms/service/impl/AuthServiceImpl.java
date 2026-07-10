package com.vinu.cms.service.impl;

import com.vinu.cms.dto.auth.AuthResponse;
import com.vinu.cms.dto.auth.LoginRequest;
import com.vinu.cms.dto.auth.RegisterRequest;
import com.vinu.cms.entity.RefreshToken;
import com.vinu.cms.entity.Role;
import com.vinu.cms.entity.User;
import com.vinu.cms.enums.RoleType;
import com.vinu.cms.exception.BadRequestException;
import com.vinu.cms.exception.ForbiddenException;
import com.vinu.cms.exception.UnauthorizedException;
import com.vinu.cms.repository.RefreshTokenRepository;
import com.vinu.cms.repository.RoleRepository;
import com.vinu.cms.repository.UserRepository;
import com.vinu.cms.security.jwt.JwtService;
import com.vinu.cms.service.AuthService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setRoles(new HashSet<>());
        user.getRoles().add(defaultRole());

        return issueTokens(userRepository.save(user));
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            throw new ForbiddenException("User account is disabled");
        }

        if (user.isAccountLocked()) {
            throw new ForbiddenException("User account is locked");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        refreshTokenRepository.deleteByUser(user);
        entityManager.flush();

        RefreshToken token = RefreshToken.builder()
                .token(refreshToken)
                .expiresAt(jwtService.extractExpiration(refreshToken)
                        .toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime())
                .user(user)
                .build();

        refreshTokenRepository.save(token);
        return new AuthResponse(accessToken, refreshToken, "Bearer");
    }

    private Role defaultRole() {
        return roleRepository.findByName(RoleType.VIEWER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleType.VIEWER);
                    return roleRepository.save(role);
                });
    }
}
