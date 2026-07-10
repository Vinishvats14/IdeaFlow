package com.vinu.cms.service;

import com.vinu.cms.dto.auth.AuthResponse;
import com.vinu.cms.dto.auth.LoginRequest;
import com.vinu.cms.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
