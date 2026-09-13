package com.example.atg_jwt_generator;

import com.example.atg_jwt_generator.domain.repository.TokenGenerator;
import com.example.atg_jwt_generator.infras.utils.AtgTokenGenerator;
import com.example.atg_jwt_generator.service.TokenService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AtgJwtGeneratorApplication {

	public static void main(String[] args) {
		SpringApplication.run(AtgJwtGeneratorApplication.class, args);
	}

}
