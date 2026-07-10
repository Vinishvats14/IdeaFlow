package com.vinu.cms.mapper;

import com.vinu.cms.dto.auth.RegisterRequest;
import com.vinu.cms.dto.user.UserResponse;
import com.vinu.cms.entity.User;

public interface UserMapper {

    User toEntity(RegisterRequest request);

    UserResponse toResponse(User user);

}