package com.example.DDDSample.application.exception;

public class OpenApiException extends RuntimeException {

    private final int statusCode;
    private final String message;

    public OpenApiException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getMessage() {
        return message;
    }
}