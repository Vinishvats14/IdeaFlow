package com.vinu.cms.repository;

import com.vinu.cms.entity.Role;
import com.vinu.cms.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name) ;
}
