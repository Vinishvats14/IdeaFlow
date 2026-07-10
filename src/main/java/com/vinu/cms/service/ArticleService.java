package com.vinu.cms.service;

import com.vinu.cms.dto.article.ArticleResponse;
import com.vinu.cms.dto.article.CreateArticleRequest;
import com.vinu.cms.dto.article.UpdateArticleRequest;
import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;

import java.util.List;

public interface ArticleService {
    ArticleResponse create(CreateArticleRequest request, String authorEmail);
    ArticleResponse update(Long id, UpdateArticleRequest request);
    ArticleResponse getById(Long id);
    ArticleResponse getBySlug(String slug);
    List<ArticleResponse> listAll(ArticleStatus status, Visibility visibility, String tagSlug, String categorySlug);
    List<ArticleResponse> listPublic(String tagSlug, String categorySlug);
    void delete(Long id);
    ArticleResponse publish(Long id);
    ArticleResponse archive(Long id);
}
