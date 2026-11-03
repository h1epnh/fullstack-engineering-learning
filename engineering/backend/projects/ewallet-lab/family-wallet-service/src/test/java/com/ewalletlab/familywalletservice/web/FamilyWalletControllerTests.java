package com.ewalletlab.familywalletservice.web;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import com.ewalletlab.familywalletservice.service.FamilyWalletService;
import com.ewalletlab.familywalletservice.service.WalletServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FamilyWalletControllerTests {

    @Mock
    private FamilyWalletService familyWalletService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final UUID parentUserId = UUID.randomUUID();
    private final UUID memberUserId = UUID.randomUUID();
    private final String memberPhone = "0901234567";
    private final String memberName = "Nguyen Van B";
    private final BigDecimal limit = new BigDecimal("5000000");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new FamilyWalletController(familyWalletService)).build();
    }

    @Test
    @DisplayName("POST /family-wallets/members thành công trả về 200 kèm DTO")
    void addMember_success_returns200() throws Exception {
        FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, limit);
        var memberView = new FamilyWalletService.MemberView(link, BigDecimal.ZERO);
        when(familyWalletService.addOrUpdateMember(eq(parentUserId), eq(memberPhone), any())).thenReturn(link);
        when(familyWalletService.toView(link)).thenReturn(memberView);

        Map<String, Object> req = Map.of(
            "parentUserId", parentUserId.toString(),
            "memberPhone", memberPhone,
            "monthlyLimit", limit
        );

        mockMvc.perform(post("/family-wallets/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.memberUserId").value(memberUserId.toString()))
            .andExpect(jsonPath("$.memberPhone").value(memberPhone))
            .andExpect(jsonPath("$.memberName").value(memberName))
            .andExpect(jsonPath("$.monthlyLimit").value(5000000));
    }

    @Test
    @DisplayName("POST /family-wallets/members thiếu SĐT trả về 400 Bad Request")
    void addMember_blankPhone_returns400() throws Exception {
        Map<String, Object> req = Map.of(
            "parentUserId", parentUserId.toString(),
            "memberPhone", "   ",
            "monthlyLimit", limit
        );

        mockMvc.perform(post("/family-wallets/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /family-wallets/members số tiền vượt trần 200.000.000đ trả về 400 Bad Request")
    void addMember_limitExceedsMax_returns400() throws Exception {
        Map<String, Object> req = Map.of(
            "parentUserId", parentUserId.toString(),
            "memberPhone", memberPhone,
            "monthlyLimit", new BigDecimal("200000001")
        );

        mockMvc.perform(post("/family-wallets/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /family-wallets/members/{id}/limit khi có link trả về 200 và DTO")
    void getLimit_exists_returns200() throws Exception {
        FamilyLink link = new FamilyLink(parentUserId, memberUserId, memberPhone, memberName, limit);
        when(familyWalletService.limitFor(memberUserId)).thenReturn(Optional.of(link));

        mockMvc.perform(get("/family-wallets/members/{memberUserId}/limit", memberUserId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.parentUserId").value(parentUserId.toString()))
            .andExpect(jsonPath("$.monthlyLimit").value(5000000));
    }

    @Test
    @DisplayName("GET /family-wallets/members/{id}/limit khi không có link trả về 404 Not Found")
    void getLimit_notFound_returns404() throws Exception {
        when(familyWalletService.limitFor(memberUserId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/family-wallets/members/{memberUserId}/limit", memberUserId))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /family-wallets/members/{id}/history khi không phải parent trả về 403 Forbidden")
    void getHistory_notParent_returns403() throws Exception {
        when(familyWalletService.memberHistory(parentUserId, memberUserId))
            .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải quản trị viên của thành viên này"));

        mockMvc.perform(get("/family-wallets/members/{memberUserId}/history", memberUserId)
                .param("parentUserId", parentUserId.toString()))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /family-wallets/members/{id}/history khi hợp lệ trả về 200 và danh sách transactions")
    void getHistory_valid_returns200() throws Exception {
        UUID walletId = UUID.randomUUID();
        var tx = new WalletServiceClient.TransactionView(
            UUID.randomUUID(), walletId, "TRANSFER_OUT", new BigDecimal("100000"), "ref1", "note", Instant.now());
        when(familyWalletService.memberHistory(parentUserId, memberUserId)).thenReturn(List.of(tx));

        mockMvc.perform(get("/family-wallets/members/{memberUserId}/history", memberUserId)
                .param("parentUserId", parentUserId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("TRANSFER_OUT"))
            .andExpect(jsonPath("$[0].amount").value(100000));
    }
}
