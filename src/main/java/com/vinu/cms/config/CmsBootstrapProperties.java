package com.vinu.cms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "cms.bootstrap")
public class CmsBootstrapProperties {
    private String adminFullName = "Super Admin";
    private String adminEmail = "admin@cms.local";
    private String adminPassword = "Admin@1234";
}
