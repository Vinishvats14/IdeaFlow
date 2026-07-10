package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.tag.TagResponse;
import com.vinu.cms.service.TagService;
import com.vinu.cms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/tags")
@RequiredArgsConstructor
public class PublicTagController {

    private final TagService tagService;

    @GetMapping
    public ApiResponse<List<TagResponse>> getAll() {
        return ResponseUtil.success("Public tags fetched successfully", tagService.getAll());
    }

    @GetMapping("/{slug}")
    public ApiResponse<TagResponse> getBySlug(@PathVariable String slug) {
        return ResponseUtil.success("Public tag fetched successfully", tagService.getBySlug(slug));
    }
}
