package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.user.CreateUserRequest;
import com.vinu.cms.dto.user.UpdateUserRequest;
import com.vinu.cms.dto.user.UserResponse;
import com.vinu.cms.service.UserService;
import com.vinu.cms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @PostMapping
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseUtil.success("User created successfully", userService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<UserResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseUtil.success("User updated successfully", userService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        return ResponseUtil.success("User fetched successfully", userService.getById(id));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @GetMapping
    public ApiResponse<List<UserResponse>> getAll() {
        return ResponseUtil.success("Users fetched successfully", userService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseUtil.success("User deleted successfully");
    }

    @PostMapping("/subscribe/{authorId}")
    public ApiResponse<Void> subscribe(@PathVariable Long authorId, Authentication authentication) {
        userService.subscribe(authentication.getName(), authorId);
        return ResponseUtil.success("Subscribed successfully");
    }

    @PostMapping("/unsubscribe/{authorId}")
    public ApiResponse<Void> unsubscribe(@PathVariable Long authorId, Authentication authentication) {
        userService.unsubscribe(authentication.getName(), authorId);
        return ResponseUtil.success("Unsubscribed successfully");
    }

    @GetMapping("/subscriptions/check/{authorId}")
    public ApiResponse<Boolean> checkSubscription(@PathVariable Long authorId, Authentication authentication) {
        return ResponseUtil.success("Subscription check completed", userService.isSubscribed(authentication.getName(), authorId));
    }

    @GetMapping("/subscriptions")
    public ApiResponse<List<UserResponse>> getSubscriptions(Authentication authentication) {
        return ResponseUtil.success("Subscriptions fetched successfully", userService.getSubscriptions(authentication.getName()));
    }
}
