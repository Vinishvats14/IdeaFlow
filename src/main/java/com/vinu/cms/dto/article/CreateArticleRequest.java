package com.vinu.cms.dto.article;

import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class CreateArticleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String excerpt;

    @NotBlank(message = "Content is required")
    private String content;

    private String slug;

    @NotNull(message = "Status is required")
    private ArticleStatus status;

    @NotNull(message = "Visibility is required")
    private Visibility visibility;

    private boolean featured;

    private String coverImageUrl;

    private Integer readTimeMinutes;

    private Long categoryId;

    private Set<Long> tagIds;
}
