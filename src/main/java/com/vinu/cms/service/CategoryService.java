package com.vinu.cms.service;

import com.vinu.cms.dto.category.CategoryResponse;
import com.vinu.cms.dto.category.CreateCategoryRequest;
import com.vinu.cms.dto.category.UpdateCategoryRequest;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse update(Long id, UpdateCategoryRequest request);
    CategoryResponse getById(Long id);
    CategoryResponse getBySlug(String slug);
    List<CategoryResponse> getAll();
    void delete(Long id);
}
