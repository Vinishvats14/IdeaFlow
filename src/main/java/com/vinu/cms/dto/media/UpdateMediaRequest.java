package com.vinu.cms.dto.media;

import lombok.Data;

@Data
public class UpdateMediaRequest {
    private String fileName;
    private String url;
    private String contentType;
    private Long fileSize;
    private String altText;
}
