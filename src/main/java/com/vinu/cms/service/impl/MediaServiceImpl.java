package com.vinu.cms.service.impl;

import com.vinu.cms.dto.media.CreateMediaRequest;
import com.vinu.cms.dto.media.MediaResponse;
import com.vinu.cms.dto.media.UpdateMediaRequest;
import com.vinu.cms.entity.Media;
import com.vinu.cms.entity.User;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.repository.MediaRepository;
import com.vinu.cms.repository.UserRepository;
import com.vinu.cms.service.MediaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MediaResponse create(CreateMediaRequest request, String uploadedByEmail) {
        User user = userRepository.findByEmail(uploadedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader not found"));
        return toResponse(mediaRepository.save(Media.builder()
                .fileName(request.getFileName())
                .url(request.getUrl())
                .contentType(request.getContentType())
                .fileSize(request.getFileSize())
                .altText(request.getAltText())
                .uploadedBy(user)
                .build()));
    }

    @Override
    @Transactional
    public MediaResponse update(Long id, UpdateMediaRequest request) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id " + id));
        if (request.getFileName() != null) media.setFileName(request.getFileName());
        if (request.getUrl() != null) media.setUrl(request.getUrl());
        if (request.getContentType() != null) media.setContentType(request.getContentType());
        if (request.getFileSize() != null) media.setFileSize(request.getFileSize());
        if (request.getAltText() != null) media.setAltText(request.getAltText());
        return toResponse(mediaRepository.save(media));
    }

    @Override
    public MediaResponse getById(Long id) {
        return toResponse(mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id " + id)));
    }

    @Override
    public List<MediaResponse> getAll() {
        return mediaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id " + id));
        mediaRepository.delete(media);
    }

    private MediaResponse toResponse(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .fileName(media.getFileName())
                .url(media.getUrl())
                .contentType(media.getContentType())
                .fileSize(media.getFileSize())
                .altText(media.getAltText())
                .uploadedById(media.getUploadedBy() != null ? media.getUploadedBy().getId() : null)
                .uploadedByEmail(media.getUploadedBy() != null ? media.getUploadedBy().getEmail() : null)
                .build();
    }
}
