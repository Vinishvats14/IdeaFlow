package com.vinu.cms.dto.article;

import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateArticleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String excerpt;

    @NotBlank(message = "Content is required")
    private String content;

    private String slug;

    private ArticleStatus status;

    private Visibility visibility;

    private Boolean featured;

    private String coverImageUrl;

    private Integer readTimeMinutes;

    private Long categoryId;

    private Set<Long> tagIds;
}
