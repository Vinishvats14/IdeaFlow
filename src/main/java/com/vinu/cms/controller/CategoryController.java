package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.dto.category.CategoryResponse;
import com.vinu.cms.dto.category.CreateCategoryRequest;
import com.vinu.cms.dto.category.UpdateCategoryRequest;
import com.vinu.cms.service.CategoryService;
import com.vinu.cms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR')")
    @PostMapping
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseUtil.success("Category created successfully", categoryService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN','EDITOR')")
    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseUtil.success("Category updated successfully", categoryService.update(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getById(@PathVariable Long id) {
        return ResponseUtil.success("Category fetched successfully", categoryService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ResponseUtil.success("Categories fetched successfully", categoryService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseUtil.success("Category deleted successfully");
    }
}
