package com.vinu.cms.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cmsOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("CMS Backend API")
                        .description("Production Ready CMS Backend")
                        .version("1.0"));

    }

}