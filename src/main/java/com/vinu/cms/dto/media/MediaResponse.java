package com.vinu.cms.dto.media;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MediaResponse {
    private Long id;
    private String fileName;
    private String url;
    private String contentType;
    private Long fileSize;
    private String altText;
    private Long uploadedById;
    private String uploadedByEmail;
}
