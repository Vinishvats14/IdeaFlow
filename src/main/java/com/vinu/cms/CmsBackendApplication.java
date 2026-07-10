package com.vinu.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        com.vinu.cms.security.jwt.JwtProperties.class,
        com.vinu.cms.config.CmsBootstrapProperties.class
})
public class CmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmsBackendApplication.class, args);
    }

}
