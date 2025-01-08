package com.finx.email_processor.api.configuration;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiDocConfiguration {

    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Payment Execution Service API")
                                .description("API document of Payment Execution Service")
                                .version("v1.0.0")
                                .license(new License().name("Galaxy FinX., JSC")))
                .externalDocs(
                        new ExternalDocumentation()
                                .description("Architecture Documentation")
                                .url("https://galaxyfinx.atlassian.net/wiki/spaces/EN/overview"));
    }
}
