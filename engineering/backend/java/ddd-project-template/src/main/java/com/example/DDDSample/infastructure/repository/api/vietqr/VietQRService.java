package com.example.DDDSample.infastructure.repository.api.vietqr;

import com.example.DDDSample.infastructure.repository.api.OpenApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VietQRService {
    private final OpenApiClient openApiClient;

    @Autowired
    public VietQRService(OpenApiClient openApiClient) {
        this.openApiClient = openApiClient;
    }

    public Object getBanks(String apiPath) {
        return openApiClient.get("https://api.vietqr.io/v2/" + apiPath, Object.class);
    }
}
