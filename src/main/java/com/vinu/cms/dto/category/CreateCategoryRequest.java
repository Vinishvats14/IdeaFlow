package com.vinu.cms.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String slug;
    private String description;
    private boolean active = true;
}
