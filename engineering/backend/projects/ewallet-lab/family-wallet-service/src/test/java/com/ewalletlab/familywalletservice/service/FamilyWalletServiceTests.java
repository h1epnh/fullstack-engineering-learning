package com.ewalletlab.familywalletservice.service;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import com.ewalletlab.familywalletservice.repository.FamilyLinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FamilyWalletServiceTests {

    @Mock
    private FamilyLinkRepository repository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private WalletServiceClient walletServiceClient;

    @Mock
    private FamilyLinkMutationExecutor mutationExecutor;

    private FamilyWalletService service;

    private final UUID parentUserId = UUID.randomUUID();
    private final UUID memberUserId = UUID.randomUUID();
    private final String memberPhone = "0901234567";
    private final String memberName = "Nguyen Van B";
    private final BigDecimal defaultLimit = new BigDecimal("5000000");

    @BeforeEach
    void setUp() {
        service = new FamilyWalletService(repository, userServiceClient, walletServiceClient, mutationExecutor);
    }

    @Nested
    @DisplayName("addOrUpdateMember tests")
    class AddOrUpdateMemberTests {

        @Test
        @DisplayName("Thêm thành viên mới thành công khi SĐT hợp lệ")
        void addMember_success() {
            var userResponse = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
            when(userServiceClient.findByPhone(memberPhone)).thenReturn(userResponse);

            FamilyLink createdLink = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, defaultLimit);
            when(mutationExecutor.upsertOnce(parentUserId, userResponse, defaultLimit)).thenReturn(createdLink);

            FamilyLink result = service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit);

            assertNotNull(result);
            assertEquals(parentUserId, result.getParentUserId());
            assertEquals(memberUserId, result.getMemberUserId());
            assertEquals(defaultLimit, result.getMonthlyLimit());
            verify(mutationExecutor, times(1)).upsertOnce(parentUserId, userResponse, defaultLimit);
        }

        @Test
        @DisplayName("Tự đặt hạn mức cho chính mình ném 400 Bad Request")
        void addMember_selfLimit_throwsBadRequest() {
            var selfResponse = new UserServiceClient.UserResponse(parentUserId, memberPhone, "Self Parent");
            when(userServiceClient.findByPhone(memberPhone)).thenReturn(selfResponse);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Không thể đặt hạn mức cho chính mình"));
            verifyNoInteractions(mutationExecutor);
        }

        @Test
        @DisplayName("SĐT không tồn tại ở user-service ném 404 Not Found")
        void addMember_userNotFound_throwsNotFound() {
            when(userServiceClient.findByPhone(memberPhone))
                .thenThrow(HttpClientErrorException.create(
                    HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, new byte[0], StandardCharsets.UTF_8));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Không tìm thấy tài khoản Ewallet Lab"));
            verifyNoInteractions(mutationExecutor);
        }

        @Test
        @DisplayName("Member đã thuộc Ví Gia Đình khác ném 409 Conflict")
        void addMember_alreadyBelongsToAnotherParent_throwsConflict() {
            var userResponse = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
            when(userServiceClient.findByPhone(memberPhone)).thenReturn(userResponse);

            when(mutationExecutor.upsertOnce(parentUserId, userResponse, defaultLimit))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT,
                    "Thành viên này đã thuộc về một Ví Gia Đình khác (mỗi thành viên chỉ thuộc 1 gia đình)"));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Thành viên này đã thuộc về một Ví Gia Đình khác"));
        }

        @Test
        @DisplayName("Cạnh tranh tạo mới (race condition) retry thành công ở lần 2")
        void addMember_concurrencyConflict_retriesAndSucceeds() {
            var userResponse = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
            when(userServiceClient.findByPhone(memberPhone)).thenReturn(userResponse);

            FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, defaultLimit);
            when(mutationExecutor.upsertOnce(parentUserId, userResponse, defaultLimit))
                .thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint"))
                .thenReturn(link);

            FamilyLink result = service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit);

            assertNotNull(result);
            assertEquals(memberUserId, result.getMemberUserId());
            verify(mutationExecutor, times(2)).upsertOnce(parentUserId, userResponse, defaultLimit);
        }

        @Test
        @DisplayName("Cạnh tranh vượt quá 3 lần retry ném 409 Conflict")
        void addMember_concurrencyConflict_exceedsMaxAttempts_throwsConflict() {
            var userResponse = new UserServiceClient.UserResponse(memberUserId, memberPhone, memberName);
            when(userServiceClient.findByPhone(memberPhone)).thenReturn(userResponse);

            when(mutationExecutor.upsertOnce(parentUserId, userResponse, defaultLimit))
                .thenThrow(new DataIntegrityViolationException("duplicate key 1"))
                .thenThrow(new DataIntegrityViolationException("duplicate key 2"))
                .thenThrow(new DataIntegrityViolationException("duplicate key 3"));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.addOrUpdateMember(parentUserId, memberPhone, defaultLimit));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Xung đột khi thêm thành viên Ví Gia Đình"));
            verify(mutationExecutor, times(3)).upsertOnce(parentUserId, userResponse, defaultLimit);
        }
    }

    @Nested
    @DisplayName("limitFor tests")
    class LimitForTests {

        @Test
        @DisplayName("Tra cứu hạn mức khi thành viên đã được liên kết trả về Optional có giá trị")
        void limitFor_memberExists_returnsLink() {
            FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, defaultLimit);
            when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.of(link));

            Optional<FamilyLink> result = service.limitFor(memberUserId);

            assertTrue(result.isPresent());
            assertEquals(defaultLimit, result.get().getMonthlyLimit());
        }

        @Test
        @DisplayName("Tra cứu hạn mức khi thành viên chưa liên kết trả về Optional rỗng (chuẩn bị map sang 404)")
        void limitFor_notLinked_returnsEmpty() {
            when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.empty());

            Optional<FamilyLink> result = service.limitFor(memberUserId);

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("memberHistory tests")
    class MemberHistoryTests {

        @Test
        @DisplayName("Xem lịch sử khi thành viên chưa liên kết ném 404 Not Found")
        void memberHistory_notLinked_throwsNotFound() {
            when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.memberHistory(parentUserId, memberUserId));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertTrue(ex.getReason().contains("chưa thuộc Ví Gia Đình"));
            verifyNoInteractions(walletServiceClient);
        }

        @Test
        @DisplayName("Parent khác xem trộm lịch sử ném 403 Forbidden")
        void memberHistory_notParent_throwsForbidden() {
            UUID anotherParent = UUID.randomUUID();
            FamilyLink link = new FamilyLink(anotherParent, memberUserId, memberPhone, memberName, defaultLimit);
            when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.of(link));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.memberHistory(parentUserId, memberUserId));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            assertTrue(ex.getReason().contains("không phải quản trị viên"));
            verifyNoInteractions(walletServiceClient);
        }

        @Test
        @DisplayName("Parent hợp lệ xem lịch sử chỉ nhận các giao dịch OUTBOUND hợp lệ")
        void memberHistory_validParent_filtersOutboundTransactions() {
            FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, defaultLimit);
            when(repository.findByMemberUserId(memberUserId)).thenReturn(Optional.of(link));

            UUID walletId = UUID.randomUUID();
            Instant now = Instant.now();
            List<WalletServiceClient.TransactionView> allTxs = List.of(
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TRANSFER_OUT", new BigDecimal("100000"), "ref1", "Chuyển tiền", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "BILL_PAYMENT", new BigDecimal("200000"), "ref2", "Tiền điện", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "WITHDRAW", new BigDecimal("300000"), "ref3", "Rút tiền", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TOPUP", new BigDecimal("500000"), "ref4", "Nạp ví", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TRANSFER_IN", new BigDecimal("150000"), "ref5", "Nhận tiền", now)
            );
            when(walletServiceClient.getTransactions(memberUserId)).thenReturn(allTxs);

            List<WalletServiceClient.TransactionView> history = service.memberHistory(parentUserId, memberUserId);

            assertEquals(3, history.size());
            assertTrue(history.stream().allMatch(tx ->
                List.of("TRANSFER_OUT", "BILL_PAYMENT", "WITHDRAW").contains(tx.type())));
        }
    }

    @Nested
    @DisplayName("listMembers and spentThisMonth calculation")
    class ListMembersAndCalculationTests {

        @Test
        @DisplayName("Tính đúng tổng chi tiêu trong tháng hiện tại và loại trừ giao dịch tháng trước lẫn INBOUND")
        void listMembers_computesSpentThisMonth() {
            FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, defaultLimit);
            when(repository.findByParentUserIdOrderByCreatedAtDesc(parentUserId)).thenReturn(List.of(link));

            UUID walletId = UUID.randomUUID();
            Instant now = Instant.now();
            Instant lastMonth = Instant.now().minus(40, ChronoUnit.DAYS);

            List<WalletServiceClient.TransactionView> txs = List.of(
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TRANSFER_OUT", new BigDecimal("150000"), "ref1", "Chuyển tiền", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "BILL_PAYMENT", new BigDecimal("250000"), "ref2", "Tiền nước", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TOPUP", new BigDecimal("1000000"), "ref3", "Nạp tiền", now),
                new WalletServiceClient.TransactionView(UUID.randomUUID(), walletId, "TRANSFER_OUT", new BigDecimal("500000"), "ref4", "Tháng trước", lastMonth)
            );
            when(walletServiceClient.getTransactions(memberUserId)).thenReturn(txs);

            List<FamilyWalletService.MemberView> views = service.listMembers(parentUserId);

            assertEquals(1, views.size());
            FamilyWalletService.MemberView view = views.getFirst();
            assertEquals(link, view.link());
            // spentThisMonth = 150_000 + 250_000 = 400_000
            assertEquals(new BigDecimal("400000"), view.spentThisMonth());
        }
    }

    @Nested
    @DisplayName("Architecture and Transaction boundary checks")
    class ArchitectureChecks {

        @Test
        @DisplayName("FamilyWalletService không mang annotation @Transactional trên class hoặc method")
        void familyWalletService_doesNotHoldTransactionalAnnotation() {
            assertFalse(FamilyWalletService.class.isAnnotationPresent(Transactional.class),
                "FamilyWalletService class không được mang @Transactional để tránh HTTP call bị bao bọc trong DB transaction");

            for (var method : FamilyWalletService.class.getDeclaredMethods()) {
                assertFalse(method.isAnnotationPresent(Transactional.class),
                    "Method " + method.getName() + " trong FamilyWalletService không được mang @Transactional");
            }
        }
    }
}
