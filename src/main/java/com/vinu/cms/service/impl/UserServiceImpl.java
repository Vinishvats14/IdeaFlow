package com.vinu.cms.service.impl;

import com.vinu.cms.dto.user.CreateUserRequest;
import com.vinu.cms.dto.user.UpdateUserRequest;
import com.vinu.cms.dto.user.UserResponse;
import com.vinu.cms.entity.Role;
import com.vinu.cms.entity.User;
import com.vinu.cms.enums.RoleType;
import com.vinu.cms.exception.BadRequestException;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.repository.RefreshTokenRepository;
import com.vinu.cms.repository.RoleRepository;
import com.vinu.cms.repository.UserRepository;
import com.vinu.cms.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setRoles(new HashSet<>(Set.of(defaultRole())));

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BadRequestException("Email is already registered");
        }

        user.setFullName(request.getFullName());
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id)));
    }

    @Override
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void subscribe(String subscriberEmail, Long authorId) {
        User subscriber = userRepository.findByEmail(subscriberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        if (subscriber.getId().equals(author.getId())) {
            throw new BadRequestException("You cannot subscribe to yourself");
        }
        subscriber.getSubscriptions().add(author);
        userRepository.save(subscriber);
    }

    @Override
    @Transactional
    public void unsubscribe(String subscriberEmail, Long authorId) {
        User subscriber = userRepository.findByEmail(subscriberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        subscriber.getSubscriptions().remove(author);
        userRepository.save(subscriber);
    }

    @Override
    @Transactional
    public boolean isSubscribed(String subscriberEmail, Long authorId) {
        User subscriber = userRepository.findByEmail(subscriberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        return subscriber.getSubscriptions().contains(author);
    }

    @Override
    @Transactional
    public List<UserResponse> getSubscriptions(String subscriberEmail) {
        User subscriber = userRepository.findByEmail(subscriberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return subscriber.getSubscriptions().stream()
                .map(this::toResponse)
                .toList();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.isEnabled(),
                user.isAccountLocked(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet())
        );
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
