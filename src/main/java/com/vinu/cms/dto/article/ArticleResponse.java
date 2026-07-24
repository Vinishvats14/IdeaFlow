package com.vinu.cms.dto.article;

import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class ArticleResponse {
    private Long id;
    private String slug;
    private String title;
    private String excerpt;
    private String content;
    private ArticleStatus status;
    private Visibility visibility;
    private boolean featured;
    private String coverImageUrl;
    private Integer readTimeMinutes;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String authorName;
    private String authorEmail;
    private Long authorId;
    private Long categoryId;
    private String categoryName;
    private Set<String> tags;
}
