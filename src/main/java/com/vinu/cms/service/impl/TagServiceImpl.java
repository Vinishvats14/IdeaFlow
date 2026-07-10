package com.vinu.cms.service.impl;

import com.vinu.cms.dto.tag.CreateTagRequest;
import com.vinu.cms.dto.tag.TagResponse;
import com.vinu.cms.dto.tag.UpdateTagRequest;
import com.vinu.cms.entity.Tag;
import com.vinu.cms.exception.BadRequestException;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.repository.TagRepository;
import com.vinu.cms.service.TagService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    @Transactional
    public TagResponse create(CreateTagRequest request) {
        String slug = resolveSlug(request.getSlug(), request.getName());
        if (tagRepository.existsBySlug(slug)) {
            throw new BadRequestException("Tag slug already exists");
        }
        return toResponse(tagRepository.save(Tag.builder()
                .name(request.getName())
                .slug(slug)
                .build()));
    }

    @Override
    @Transactional
    public TagResponse update(Long id, UpdateTagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id " + id));
        String slug = resolveSlug(request.getSlug(), request.getName());
        if (!slug.equals(tag.getSlug()) && tagRepository.existsBySlug(slug)) {
            throw new BadRequestException("Tag slug already exists");
        }
        tag.setName(request.getName());
        tag.setSlug(slug);
        return toResponse(tagRepository.save(tag));
    }

    @Override
    public TagResponse getById(Long id) {
        return toResponse(tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id " + id)));
    }

    @Override
    public TagResponse getBySlug(String slug) {
        return toResponse(tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with slug " + slug)));
    }

    @Override
    public List<TagResponse> getAll() {
        return tagRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id " + id));
        tagRepository.delete(tag);
    }

    private TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .build();
    }

    private String resolveSlug(String slug, String name) {
        String value = (slug == null || slug.isBlank()) ? name : slug;
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
    }
}
