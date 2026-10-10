package com.ewalletlab.userservice;

import com.ewalletlab.userservice.domain.KycTier;
import com.ewalletlab.userservice.domain.User;
import com.ewalletlab.userservice.repository.UserRepository;
import com.ewalletlab.userservice.web.UserController;
import com.ewalletlab.userservice.web.dto.RegisterRequest;
import com.ewalletlab.userservice.web.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTests {

    @Mock
    private UserRepository userRepository;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(userRepository);
    }

    @Test
    @DisplayName("User mới đăng ký mặc định có trạng thái UNVERIFIED")
    void testNewUserRegistrationDefaultsToUnverified() {
        RegisterRequest request = new RegisterRequest("0901234567", "Nguyen Van A");

        when(userRepository.findByPhone("0901234567")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", UUID.randomUUID());
            return user;
        });

        ResponseEntity<UserResponse> response = userController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(KycTier.UNVERIFIED, response.getBody().kycTier());
        assertNull(response.getBody().idCardNumber());
    }

    @Test
    @DisplayName("User cũ chưa có kycTier khi load lên mặc định VERIFIED")
    void testLegacyUserDefaultsToVerified() {
        User legacyUser = new User("0909999999", "Old User");
        ReflectionTestUtils.setField(legacyUser, "kycTier", null);

        // When getKycTier is called, it returns VERIFIED
        assertEquals(KycTier.VERIFIED, legacyUser.getKycTier());
    }

    @Test
    @DisplayName("Xác thực eKYC cập nhật kycTier thành VERIFIED và lưu CCCD")
    void testVerifyKycSuccess() {
        UUID userId = UUID.randomUUID();
        User user = new User("0901112233", "Tran Thi B");
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserController.VerifyKycRequest req = new UserController.VerifyKycRequest("001200001234");
        ResponseEntity<UserResponse> response = userController.verifyKyc(userId, req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(KycTier.VERIFIED, response.getBody().kycTier());
        assertEquals("001200001234", response.getBody().idCardNumber());
    }
}
