package com.vinu.cms.config;

import com.vinu.cms.entity.Permission;
import com.vinu.cms.entity.Role;
import com.vinu.cms.entity.User;
import com.vinu.cms.enums.PermissionType;
import com.vinu.cms.enums.RoleType;
import com.vinu.cms.repository.PermissionRepository;
import com.vinu.cms.repository.RoleRepository;
import com.vinu.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CmsBootstrap implements ApplicationRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CmsBootstrapProperties properties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Set<Permission> permissions = seedPermissions();
        seedRoles(permissions);
        seedSuperAdmin();
    }

    private Set<Permission> seedPermissions() {
        Set<Permission> permissions = new HashSet<>();
        for (PermissionType type : PermissionType.values()) {
            permissions.add(permissionRepository.findByName(type)
                    .orElseGet(() -> permissionRepository.save(Permission.builder().name(type).build())));
        }
        return permissions;
    }

    private void seedRoles(Set<Permission> permissions) {
        saveRole(RoleType.SUPER_ADMIN, permissions);
        saveRole(RoleType.ADMIN, permissionsFor(
                PermissionType.CREATE_USER,
                PermissionType.UPDATE_USER,
                PermissionType.DELETE_USER,
                PermissionType.VIEW_USERS,
                PermissionType.CREATE_ARTICLE,
                PermissionType.UPDATE_ARTICLE,
                PermissionType.DELETE_ARTICLE,
                PermissionType.PUBLISH_ARTICLE,
                PermissionType.VIEW_ARTICLE,
                PermissionType.CREATE_CATEGORY,
                PermissionType.UPDATE_CATEGORY,
                PermissionType.DELETE_CATEGORY,
                PermissionType.CREATE_TAG,
                PermissionType.UPDATE_TAG,
                PermissionType.DELETE_TAG,
                PermissionType.UPLOAD_MEDIA,
                PermissionType.DELETE_MEDIA,
                PermissionType.VIEW_DASHBOARD
        ));
        saveRole(RoleType.EDITOR, permissionsFor(
                PermissionType.CREATE_ARTICLE,
                PermissionType.UPDATE_ARTICLE,
                PermissionType.DELETE_ARTICLE,
                PermissionType.PUBLISH_ARTICLE,
                PermissionType.VIEW_ARTICLE,
                PermissionType.CREATE_CATEGORY,
                PermissionType.UPDATE_CATEGORY,
                PermissionType.DELETE_CATEGORY,
                PermissionType.CREATE_TAG,
                PermissionType.UPDATE_TAG,
                PermissionType.DELETE_TAG,
                PermissionType.UPLOAD_MEDIA,
                PermissionType.DELETE_MEDIA,
                PermissionType.VIEW_DASHBOARD
        ));
        saveRole(RoleType.AUTHOR, permissionsFor(
                PermissionType.CREATE_ARTICLE,
                PermissionType.UPDATE_ARTICLE,
                PermissionType.DELETE_ARTICLE,
                PermissionType.VIEW_ARTICLE,
                PermissionType.UPLOAD_MEDIA,
                PermissionType.VIEW_DASHBOARD
        ));
        saveRole(RoleType.VIEWER, permissionsFor(PermissionType.VIEW_ARTICLE));
    }

    private void seedSuperAdmin() {
        userRepository.findByEmail(properties.getAdminEmail()).orElseGet(() -> {
            Role superAdmin = roleRepository.findByName(RoleType.SUPER_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("SUPER_ADMIN role missing"));
            User user = new User();
            user.setFullName(properties.getAdminFullName());
            user.setEmail(properties.getAdminEmail());
            user.setPassword(passwordEncoder.encode(properties.getAdminPassword()));
            user.setEnabled(true);
            user.setAccountLocked(false);
            user.setRoles(new HashSet<>(Set.of(superAdmin)));
            return userRepository.save(user);
        });
    }

    private void saveRole(RoleType type, Set<Permission> permissions) {
        roleRepository.findByName(type).orElseGet(() -> {
            Role role = new Role();
            role.setName(type);
            role.setPermissions(new HashSet<>(permissions));
            return roleRepository.save(role);
        });
    }

    private Set<Permission> permissionsFor(PermissionType... types) {
        Set<Permission> permissions = new HashSet<>();
        for (PermissionType type : types) {
            permissionRepository.findByName(type).ifPresent(permissions::add);
        }
        return permissions;
    }
}
