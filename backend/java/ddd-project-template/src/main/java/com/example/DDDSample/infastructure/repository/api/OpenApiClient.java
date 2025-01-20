package com.example.DDDSample.infastructure.repository.api;

import com.example.DDDSample.application.exception.OpenApiException;

public interface OpenApiClient {
    <T> T get(String url, Class<T> responseType) throws OpenApiException;

    <T> T post(String url, Object requestBody, Class<T> responseType) throws OpenApiException;

    // Add methods for PUT, DELETE as needed
}
