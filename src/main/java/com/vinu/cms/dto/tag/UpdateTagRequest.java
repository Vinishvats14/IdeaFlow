package com.vinu.cms.dto.tag;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTagRequest {
    @NotBlank(message = "Tag name is required")
    private String name;
    private String slug;
}
