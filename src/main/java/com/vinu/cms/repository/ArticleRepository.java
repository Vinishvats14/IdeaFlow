package com.vinu.cms.repository;

import com.vinu.cms.entity.Article;
import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Naya Import
import org.springframework.data.repository.query.Param; // <-- Naya Import

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Article> findByStatusAndVisibility(ArticleStatus status, Visibility visibility);

    List<Article> findByStatus(ArticleStatus status);

    // Naya optimized method jo database level par filtering karega
    @Query("SELECT DISTINCT a FROM Article a " +
            "LEFT JOIN a.tags t " +
            "LEFT JOIN a.category c " +
            "WHERE (:status IS NULL OR a.status = :status) " +
            "AND (:visibility IS NULL OR a.visibility = :visibility) " +
            "AND (:tagSlug IS NULL OR t.slug = :tagSlug) " +
            "AND (:categorySlug IS NULL OR c.slug = :categorySlug)")
    List<Article> findByFilters(
            @Param("status") ArticleStatus status,
            @Param("visibility") Visibility visibility,
            @Param("tagSlug") String tagSlug,
            @Param("categorySlug") String categorySlug
    );
}