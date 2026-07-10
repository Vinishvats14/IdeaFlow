package com.vinu.cms.service.impl;

import com.vinu.cms.dto.category.CategoryResponse;
import com.vinu.cms.dto.category.CreateCategoryRequest;
import com.vinu.cms.dto.category.UpdateCategoryRequest;
import com.vinu.cms.entity.Category;
import com.vinu.cms.exception.BadRequestException;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.repository.CategoryRepository;
import com.vinu.cms.service.CategoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        String slug = resolveSlug(request.getSlug(), request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug already exists");
        }

        return toResponse(categoryRepository.save(Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .active(request.isActive())
                .build()));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        String slug = resolveSlug(request.getSlug(), request.getName());
        if (!slug.equals(category.getSlug()) && categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug already exists");
        }
        category.setName(request.getName());
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse getById(Long id) {
        return toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id)));
    }

    @Override
    public CategoryResponse getBySlug(String slug) {
        return toResponse(categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug " + slug)));
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .active(category.isActive())
                .build();
    }

    private String resolveSlug(String slug, String name) {
        String value = (slug == null || slug.isBlank()) ? name : slug;
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
    }
}
