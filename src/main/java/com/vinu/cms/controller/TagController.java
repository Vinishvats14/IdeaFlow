package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.tag.CreateTagRequest;
import com.vinu.cms.dto.tag.TagResponse;
import com.vinu.cms.dto.tag.UpdateTagRequest;
import com.vinu.cms.service.TagService;
import com.vinu.cms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR')")
    @PostMapping
    public ApiResponse<TagResponse> create(@Valid @RequestBody CreateTagRequest request) {
        return ResponseUtil.success("Tag created successfully", tagService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR')")
    @PutMapping("/{id}")
    public ApiResponse<TagResponse> update(@PathVariable Long id,
                                           @Valid @RequestBody UpdateTagRequest request) {
        return ResponseUtil.success("Tag updated successfully", tagService.update(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<TagResponse> getById(@PathVariable Long id) {
        return ResponseUtil.success("Tag fetched successfully", tagService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<TagResponse>> getAll() {
        return ResponseUtil.success("Tags fetched successfully", tagService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseUtil.success("Tag deleted successfully");
    }
}
