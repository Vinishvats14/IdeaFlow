package com.vinu.cms.service;

import com.vinu.cms.dto.media.CreateMediaRequest;
import com.vinu.cms.dto.media.MediaResponse;
import com.vinu.cms.dto.media.UpdateMediaRequest;

import java.util.List;

public interface MediaService {
    MediaResponse create(CreateMediaRequest request, String uploadedByEmail);
    MediaResponse update(Long id, UpdateMediaRequest request);
    MediaResponse getById(Long id);
    List<MediaResponse> getAll();
    void delete(Long id);
}
