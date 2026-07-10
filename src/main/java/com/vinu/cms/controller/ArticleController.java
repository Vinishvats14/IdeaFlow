package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.article.ArticleResponse;
import com.vinu.cms.dto.article.CreateArticleRequest;
import com.vinu.cms.dto.article.UpdateArticleRequest;
import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import com.vinu.cms.service.ArticleService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PostMapping
    public ApiResponse<ArticleResponse> create(@Valid @RequestBody CreateArticleRequest request,
                                               Authentication authentication) {
        return ResponseUtil.success("Article created successfully",
                articleService.create(request, authentication.getName()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PutMapping("/{id}")
    public ApiResponse<ArticleResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdateArticleRequest request) {
        return ResponseUtil.success("Article updated successfully", articleService.update(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ArticleResponse> getById(@PathVariable Long id) {
        return ResponseUtil.success("Article fetched successfully", articleService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<ArticleResponse>> listAll(
            @RequestParam(required = false) ArticleStatus status,
            @RequestParam(required = false) Visibility visibility,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category
    ) {
        return ResponseUtil.success("Articles fetched successfully",
                articleService.listAll(status, visibility, tag, category));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ResponseUtil.success("Article deleted successfully");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PostMapping("/{id}/publish")
    public ApiResponse<ArticleResponse> publish(@PathVariable Long id) {
        return ResponseUtil.success("Article published successfully", articleService.publish(id));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR','AUTHOR')")
    @PostMapping("/{id}/archive")
    public ApiResponse<ArticleResponse> archive(@PathVariable Long id) {
        return ResponseUtil.success("Article archived successfully", articleService.archive(id));
    }
}
