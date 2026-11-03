package com.ewalletlab.familywalletservice.service;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import com.ewalletlab.familywalletservice.repository.FamilyLinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FamilyLinkMutationExecutorTests {

    @Mock
    private FamilyLinkRepository repository;

    private FamilyLinkMutationExecutor executor;

    private final UUID parentUserId = UUID.randomUUID();
    private final UUID memberUserId = UUID.randomUUID();
    private final String memberPhone = "0901234567";
    private final String memberName = "Nguyen Van B";
    private final BigDecimal initialLimit = new BigDecimal("2000000");
    private final BigDecimal newLimit = new BigDecimal("5000000");

    @BeforeEach
    void setUp() {
        executor = new FamilyLinkMutationExecutor(repository);
    }

    @Test
    @DisplayName("Thành viên chưa tồn tại -> tạo mới FamilyLink và lưu DB")
    void upsertOnce_newMember_createsAndSaves() {
        var member = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
        when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.empty());
        when(repository.save(any(FamilyLink.class))).thenAnswer(inv -> inv.getArgument(0));

        FamilyLink result = executor.upsertOnce(parentUserId, member, initialLimit);

        assertNotNull(result);
        assertEquals(parentUserId, result.getParentUserId());
        assertEquals(memberUserId, result.getMemberUserId());
        assertEquals(memberPhone, result.getMemberPhone());
        assertEquals(memberName, result.getMemberName());
        assertEquals(initialLimit, result.getMonthlyLimit());

        ArgumentCaptor<FamilyLink> captor = ArgumentCaptor.forClass(FamilyLink.class);
        verify(repository).save(captor.capture());
        assertEquals(parentUserId, captor.getValue().getParentUserId());
        assertEquals(memberUserId, captor.getValue().getMemberUserId());
    }

    @Test
    @DisplayName("Thành viên đã thuộc cùng parent -> cập nhật hạn mức mới (upsert)")
    void upsertOnce_sameParent_updatesLimit() {
        var member = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
        FamilyLink existingLink = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, initialLimit);
        when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.of(existingLink));
        when(repository.save(any(FamilyLink.class))).thenAnswer(inv -> inv.getArgument(0));

        FamilyLink result = executor.upsertOnce(parentUserId, member, newLimit);

        assertNotNull(result);
        assertEquals(newLimit, result.getMonthlyLimit());
        verify(repository).save(existingLink);
    }

    @Test
    @DisplayName("Thành viên đã thuộc parent khác -> ném 409 Conflict")
    void upsertOnce_differentParent_throwsConflict() {
        UUID otherParent = UUID.randomUUID();
        var member = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
        FamilyLink existingLink = new FamilyLink(otherParent, memberUserId, memberPhone, memberName, initialLimit);
        when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.of(existingLink));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> executor.upsertOnce(parentUserId, member, newLimit));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Thành viên này đã thuộc về một Ví Gia Đình khác"));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("upsertOnce method phải được đánh dấu @Transactional để cô lập transaction DB")
    void upsertOnce_hasTransactionalAnnotation() throws NoSuchMethodException {
        Method method = FamilyLinkMutationExecutor.class.getDeclaredMethod(
            "upsertOnce", UUID.class, UserServiceClient.UserResponse.class, BigDecimal.class);
        assertTrue(method.isAnnotationPresent(Transactional.class),
            "FamilyLinkMutationExecutor.upsertOnce phải có @Transactional");
    }
}
