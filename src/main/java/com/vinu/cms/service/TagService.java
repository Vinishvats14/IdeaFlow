package com.vinu.cms.service;

import com.vinu.cms.dto.tag.CreateTagRequest;
import com.vinu.cms.dto.tag.TagResponse;
import com.vinu.cms.dto.tag.UpdateTagRequest;

import java.util.List;

public interface TagService {
    TagResponse create(CreateTagRequest request);
    TagResponse update(Long id, UpdateTagRequest request);
    TagResponse getById(Long id);
    TagResponse getBySlug(String slug);
    List<TagResponse> getAll();
    void delete(Long id);
}
