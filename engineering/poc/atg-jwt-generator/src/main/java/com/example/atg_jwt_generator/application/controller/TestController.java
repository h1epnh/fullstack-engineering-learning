package com.example.atg_jwt_generator.application.controller;

import com.example.atg_jwt_generator.domain.object.GetEncryptedCardInfoResponse;
import com.example.atg_jwt_generator.domain.object.GetTokenResponse;
import com.example.atg_jwt_generator.service.EncryptedCardDataService;
import com.example.atg_jwt_generator.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@RestController
@RequestMapping
public class TestController {

    private final TokenService tokenService;
    private final EncryptedCardDataService encryptedCardDataService;

    public TestController(TokenService tokenService) {
        this.tokenService = tokenService;
        this.encryptedCardDataService = new EncryptedCardDataService();
    }

    @GetMapping("/v1/token")
    public GetTokenResponse getToken() {
        String cardId = "1234567890123456"; // Example card ID
        String clientNumber = "1234567890"; // Example client number
        return new GetTokenResponse(tokenService.generateToken(cardId, clientNumber), "00", "SUCCESS") ;
    }

    @GetMapping("/v1/encrypted-card-info")
    public GetEncryptedCardInfoResponse getEncryptedCardData(
            @RequestParam String accountNumber, // e.g., "5180123456789012"
            @RequestParam String expiryMonth,   // e.g., "03"
            @RequestParam String expiryYear     // e.g., "29" (for 2029)
    ) {
        // --- IMPORTANT ---
        // This endpoint MUST be secured. Only authenticated and authorized users/apps
        // should be able to request encrypted data for their cards.
        // For POC, we are skipping authentication.
        // -----------------

        try {
            // For MasterCard, you MIGHT need to get an OPC from MDES first,
            // and that OPC becomes part of (or is) the cardPayloadJson.
            // This POC assumes ATG expects raw(ish) card data to be JWE'd by *your* server.
            // **CLARIFY THIS WITH ATG**
//            String encryptedData = encryptedCardDataService.generateEncryptedCardData(
//                    accountNumber, expiryMonth, expiryYear
//
//            );


            //MOCK DATA
            String encryptedData = "eyJleHAiOjE3NDg1NzU3OTMsImlhdCI6MTc0ODU3MzI3MywiYWxnIjoiSFMyNTYifQ.ZXlKMGVYQWlPaUpLVDFORklpd2laVzVqSWpvaVFUSTFOa2REVFNJc0luUmhaeUk2SWtkUlpHaGtjVUl0UTFSRmNtVnFOVTh6TVVObGVGRWlMQ0poYkdjaU9pSkJNalUyUjBOTlMxY2lMQ0pwZGlJNklqSnJiRkpJU0ZwSFFsRkpRbFl6YW5jaWZRLnVaQU5kclhZWWZGenNtN1Uta1BKbFA4a3d3YTNjVzQ2QmlFanJDNGxtczguWGVUT1BzMDdjUDNqQmM0Sy45RFJUZnMxd1VZZ3pKczQtOWhwNXBwTjhYdGZDNzIycU4yQkRuRnBUWlpxeWNqVE9qb3FESFBzSlBORXI5R25qRkt2LU5IZGZmRkJrSkhfVHNVaDlsN1hJaTdXUTZkZ0tLUmNNUEN0V1J5T1RmWXdCeFh6dDZIRndvNnRuam5VTkh0blNER1FuNnNTYk5fbkswclVYLVZNbWEtbTVEZUdtdFdUME1IQmlwaXhqekFXc0pfTE5PbmJsREswbzd3c0pHQlhYX2wwWkJMNVU1UllqRGx6RTRNVWJrNGR2cWF4bmg5N0p1dUJmTDZXUWhDRUlrWWUySUFsVjFOQ3RtbFpYRGt4Z3hLSC1EM1daRTZwSVhRRDNhNUtSblhjQUNfR0w3Y3FyYkp2a2QycXJMY2wtMHYyWmxwWGM2RVRaVXkxeU0tVE93OWNvQ2IxUklMbWdmZDNkbWRFSWVnNUxERmlJUWdQSmp3bm13S05XMFF0R1J6WlR3U3l1Wmt2ZXVhYjRwdkh0TGJKakpNU1RYNEI1RmhTQUtmOXFFY00xM2tDZlROWHdiZm1nU1p1UGxyaUZmS1RVb1JSbk9zLXBXT01yaUtNN19WcllRUE5ySWxQazV0Q1c3dTdJTGh3RzhDV3Fob0R5Y0xleUt0RnhKSTlUOTRSMzdSc0ZwTFppLUxZOVg5d0lLRWpUZXQ0Y3l0ZGZORHBteHR6WFNHbzFLeVZRZFl0WVVpZDB3X0ZpQnl4ZmJ3eS1rSExWUC1aa0FrdXVqczdBSjlqNVo2YzV4S2dja21qSjg4SnpYdkllTnNCUFBMNjVrYlVXcFktU3VZSEkzLTVNekZ5eFZZb1paSXpydV8yWElrNE1Tb2ViZl9PRFlYWWpBSXQwTjBsbUVHUVNEVHlNRXBuOXdzSTctV3BDb19QaUQ0cnoxWjJvd1N5VXFxeWxRQkVsSGx6Y29yMWhuODFnUFczTE9BZUpjTDdDUGI5X0hySVVrOWlCVVpFT1dpMVFabGZEZ0FCREJmZE1fOXludVZia3pZVEJZR0ZqS0J6VmxVMnFnMkp6a0tic052UF9CazRNdnE2T0w3MUdMYS16eExwQ0pjZ0owZy5RZU1HTnVNR0ZkV204eEVBaVJ4azFB.l6S7BeFi_cWYhZCU4We_c7lCzx6X5HC99Q_w5Y7iRRw";

            return new GetEncryptedCardInfoResponse(encryptedData, "00", "SUCCESS");
        } catch (Exception e) {
            // Log the exception properly
            e.printStackTrace();
            return new GetEncryptedCardInfoResponse("error", "Failed to generate encrypted card data", e.getMessage());
        }
    }

}