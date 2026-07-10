package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.media.CreateMediaRequest;
import com.vinu.cms.dto.media.MediaResponse;
import com.vinu.cms.dto.media.UpdateMediaRequest;
import com.vinu.cms.service.MediaService;
import com.vinu.cms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PostMapping
    public ApiResponse<MediaResponse> create(@Valid @RequestBody CreateMediaRequest request,
                                             Authentication authentication) {
        return ResponseUtil.success("Media uploaded successfully",
                mediaService.create(request, authentication.getName()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PutMapping("/{id}")
    public ApiResponse<MediaResponse> update(@PathVariable Long id,
                                             @Valid @RequestBody UpdateMediaRequest request) {
        return ResponseUtil.success("Media updated successfully", mediaService.update(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<MediaResponse> getById(@PathVariable Long id) {
        return ResponseUtil.success("Media fetched successfully", mediaService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<MediaResponse>> getAll() {
        return ResponseUtil.success("Media fetched successfully", mediaService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mediaService.delete(id);
        return ResponseUtil.success("Media deleted successfully");
    }
}
