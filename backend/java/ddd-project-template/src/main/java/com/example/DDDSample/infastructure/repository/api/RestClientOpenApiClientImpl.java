package com.example.DDDSample.infastructure.repository.api;

import com.example.DDDSample.application.exception.OpenApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

@Component
public class RestClientOpenApiClientImpl implements OpenApiClient {

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public <T> T get(String url, Class<T> responseType) throws OpenApiException {
        try {
            ResponseEntity<T> response = restTemplate.getForEntity(url, responseType);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new OpenApiException(response.getStatusCodeValue(),
                        "Error retrieving data: " + response.getBody());
            }
            return response.getBody();
        } catch (RestClientResponseException ex) {
            throw new OpenApiException(ex.getRawStatusCode(), ex.getMessage());
        }
    }

    @Override
    public <T> T post(String url, Object requestBody, Class<T> responseType) throws OpenApiException {
        return null;
    }
}
