package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.article.ArticleResponse;
import com.vinu.cms.service.ArticleService;
import com.vinu.cms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/articles")
@RequiredArgsConstructor
public class PublicArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ApiResponse<List<ArticleResponse>> listPublic(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category
    ) {
        return ResponseUtil.success("Public articles fetched successfully",
                articleService.listPublic(tag, category));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ArticleResponse> getBySlug(@PathVariable String slug) {
        return ResponseUtil.success("Public article fetched successfully", articleService.getBySlug(slug));
    }
}
