package com.vinu.cms.dto.media;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMediaRequest {
    @NotBlank(message = "File name is required")
    private String fileName;
    @NotBlank(message = "URL is required")
    private String url;
    private String contentType;
    private Long fileSize;
    private String altText;
}
