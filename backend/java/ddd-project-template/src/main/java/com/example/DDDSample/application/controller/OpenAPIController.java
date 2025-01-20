package com.example.DDDSample.application.controller;

import com.example.DDDSample.infastructure.repository.api.vietqr.VietQRService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/open-api/v1")
public class OpenAPIController {

    private final VietQRService vietQRService;

    public OpenAPIController(VietQRService vietQRService) {
        this.vietQRService = vietQRService;
    }


    @RequestMapping("/getBanks")
    public Object getBanks() {
        return vietQRService.getBanks("banks");
    }

}
