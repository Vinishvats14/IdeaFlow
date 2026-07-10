package com.vinu.cms.repository;

import com.vinu.cms.entity.Permission;
import com.vinu.cms.enums.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(PermissionType name);
}
