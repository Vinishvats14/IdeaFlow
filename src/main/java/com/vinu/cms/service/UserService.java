package com.vinu.cms.service;

import com.vinu.cms.dto.auth.LoginRequest;
import com.vinu.cms.dto.user.CreateUserRequest;
import com.vinu.cms.dto.user.UpdateUserRequest;
import com.vinu.cms.dto.user.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse create(CreateUserRequest request);

    UserResponse update(Long id, UpdateUserRequest request);

    UserResponse getById(Long id);

    List<UserResponse> getAll();

    void delete(Long id);
}
