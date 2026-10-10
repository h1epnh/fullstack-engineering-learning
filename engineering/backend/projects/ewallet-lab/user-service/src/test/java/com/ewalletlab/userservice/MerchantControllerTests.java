package com.ewalletlab.userservice;

import com.ewalletlab.userservice.domain.Merchant;
import com.ewalletlab.userservice.domain.User;
import com.ewalletlab.userservice.repository.MerchantRepository;
import com.ewalletlab.userservice.repository.UserRepository;
import com.ewalletlab.userservice.web.MerchantController;
import com.ewalletlab.userservice.web.dto.MerchantResponse;
import com.ewalletlab.userservice.web.dto.RegisterMerchantRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MerchantControllerTests {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private UserRepository userRepository;

    private MerchantController merchantController;

    @BeforeEach
    void setUp() {
        merchantController = new MerchantController(merchantRepository, userRepository);
    }

    @Test
    @DisplayName("Đăng ký tài khoản Merchant thành công tạo mã QR tĩnh hợp lệ")
    void testRegisterMerchantSuccess() {
        UUID userId = UUID.randomUUID();
        User user = new User("0908888999", "Shop Chu Ba");
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(merchantRepository.existsByUserId(userId)).thenReturn(false);

        UUID merchantId = UUID.randomUUID();
        when(merchantRepository.save(any(Merchant.class))).thenAnswer(invocation -> {
            Merchant m = invocation.getArgument(0);
            ReflectionTestUtils.setField(m, "id", merchantId);
            return m;
        });

        RegisterMerchantRequest req = new RegisterMerchantRequest(userId, "Shop Chu Ba", "Tạp hoá");
        ResponseEntity<MerchantResponse> response = merchantController.register(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Shop Chu Ba", response.getBody().merchantName());
        assertEquals("Tạp hoá", response.getBody().businessCategory());
        assertTrue(response.getBody().merchantQrCode().startsWith("ewalletlab://pay?merchant="));
        assertTrue(response.getBody().merchantQrCode().contains("phone=0908888999"));
        assertTrue(response.getBody().merchantQrCode().contains("name=Shop+Chu+Ba"));
    }

    @Test
    @DisplayName("Đăng ký trùng lặp Merchant cho cùng 1 user ném ra 409 Conflict")
    void testRegisterDuplicateMerchantThrowsConflict() {
        UUID userId = UUID.randomUUID();
        User user = new User("0908888999", "Shop Chu Ba");
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(merchantRepository.existsByUserId(userId)).thenReturn(true);

        RegisterMerchantRequest req = new RegisterMerchantRequest(userId, "Shop Chu Ba", "Tạp hoá");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> merchantController.register(req));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }
}
