package com.finx.payment_execution.api.mapper;

import com.finx.cbspojo.domain.CbsInstruction;
import com.finx.cbspojo.domain.DenominationType;
import com.finx.cbspojo.domain.RtfChannel;
import com.finx.cbspojo.domain.RtfMessage;
import com.finx.cbspojo.domain.RtfPosting;
import com.finx.cbspojo.domain.RtfPostingType;
import com.finx.cbspojo.domain.RtfResult;
import com.finx.cbspojo.domain.RtfType;
import com.finx.cbspojo.domain.TransactionType;
import com.finx.payment_execution.api.dto.request.CardAuthorizationTransactionRequest;
import com.finx.payment_execution.api.dto.request.CardReversalTransactionRequest;
import com.finx.payment_execution.api.dto.request.CardSettlementTransactionRequest;
import com.finx.payment_execution.api.dto.request.InterIncomingSettlementRequest;
import com.finx.payment_execution.api.dto.request.InterOutgoingSettlementRequest;
import com.finx.payment_execution.api.dto.request.InterTransactionAuthorizedRequest;
import com.finx.payment_execution.api.dto.request.InterTransactionReversalRequest;
import com.finx.payment_execution.api.dto.request.IntraTransactionTransferRequest;
import com.finx.payment_execution.api.dto.request.RepaymentTransactionRequest;
import com.finx.payment_execution.api.dto.request.RepostingTransactionRequest;
import com.finx.payment_execution.api.dto.request.RtfAuthorizedPostingDto;
import com.finx.payment_execution.api.dto.request.RtfReversalPostingDto;
import com.finx.payment_execution.api.dto.request.TimeDepositTransactionRequest;
import com.finx.payment_execution.api.dto.response.CbsInstructionDto;
import com.finx.payment_execution.api.dto.response.RtfMessageResponse;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
        value = "org.mapstruct.ap.MappingProcessor",
        date = "2023-11-15T20:46:38+0700",
        comments =
                "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.35.0.v20230814-2020, environment: Java 17.0.8.1 (Eclipse Adoptium)")
@Component
public class PaymentTransactionMapperImpl implements PaymentTransactionMapper {

    @Override
    public RtfMessageResponse toResponseDto(RtfResult request) {
        if (request == null) {
            return null;
        }

        String responseCode = null;
        TransactionType type = null;
        String transactionId = null;
        String message = null;
        String authCode = null;
        String referenceNumber = null;
        List<CbsInstructionDto> postingInstructions = null;
        ZonedDateTime insertionTimestamp = null;

        responseCode = request.getResponseCode();
        type = request.getType();
        transactionId = request.getTransactionId();
        message = request.getMessage();
        authCode = request.getAuthCode();
        referenceNumber = request.getReferenceNumber();
        postingInstructions = toDtoList(request.getPostingInstructions());
        insertionTimestamp = request.getInsertionTimestamp();

        RtfMessageResponse rtfMessageResponse =
                new RtfMessageResponse(
                        responseCode,
                        type,
                        transactionId,
                        message,
                        authCode,
                        referenceNumber,
                        postingInstructions,
                        insertionTimestamp);

        return rtfMessageResponse;
    }

    @Override
    public RtfMessage toDomain(CardAuthorizationTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorCode(request.acceptorCode());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.mcc(request.mcc());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfAuthorizedPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.terminalId(request.terminalId());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.AUTHORIZED);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(IntraTransactionTransferRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.channel(request.channel());
        rtfMessage.createdDate(request.createdDate());
        if (request.currency() != null) {
            rtfMessage.currency(Enum.valueOf(DenominationType.class, request.currency()));
        }
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        rtfMessage.postings(rtfAuthorizedPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(CardReversalTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorCode(request.acceptorCode());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.authCode(request.authCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.mcc(request.mcc());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfReversalPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.terminalId(request.terminalId());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.REVERSAL);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(InterIncomingSettlementRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.bankCode(request.bankCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfAuthorizedPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(InterTransactionReversalRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.authCode(request.authCode());
        rtfMessage.bankCode(request.bankCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfReversalPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.REVERSAL);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(RepaymentTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.channel(request.channel());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        List<RtfPosting> list = request.postings();
        if (list != null) {
            rtfMessage.postings(new ArrayList<RtfPosting>(list));
        }
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(TimeDepositTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.channel(request.channel());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.narrative(request.narrative());
        List<RtfPosting> list = request.postings();
        if (list != null) {
            rtfMessage.postings(new ArrayList<RtfPosting>(list));
        }
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(InterTransactionAuthorizedRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.authCode(request.authCode());
        rtfMessage.bankCode(request.bankCode());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfAuthorizedPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.AUTHORIZED);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(InterOutgoingSettlementRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.authCode(request.authCode());
        rtfMessage.bankCode(request.bankCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(rtfReversalPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(CardSettlementTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        rtfMessage.acceptorCity(request.acceptorCity());
        rtfMessage.acceptorCode(request.acceptorCode());
        rtfMessage.acceptorName(request.acceptorName());
        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.auditNumber(request.auditNumber());
        rtfMessage.authCode(request.authCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.mcc(request.mcc());
        rtfMessage.narrative(request.narrative());
        rtfMessage.postings(rtfReversalPostingDtoListToRtfPostingList(request.postings()));
        rtfMessage.referenceNumber(request.referenceNumber());
        rtfMessage.rtfType(request.rtfType());
        rtfMessage.terminalId(request.terminalId());
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);

        return rtfMessage.build();
    }

    @Override
    public RtfMessage toDomain(RepostingTransactionRequest request) {
        if (request == null) {
            return null;
        }

        RtfMessage.RtfMessageBuilder rtfMessage = RtfMessage.builder();

        Map<String, String> map = request.additionalData();
        if (map != null) {
            rtfMessage.additionalData(new LinkedHashMap<String, String>(map));
        }
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.narrative(request.narrative());
        List<RtfPosting> list = request.postings();
        if (list != null) {
            rtfMessage.postings(new ArrayList<RtfPosting>(list));
        }
        rtfMessage.toAccount(request.toAccount());
        rtfMessage.transactionId(request.transactionId());
        rtfMessage.transmissionDateTime(request.transmissionDateTime());
        rtfMessage.type(request.type());

        rtfMessage.rtfPostingType(RtfPostingType.SETTLEMENT);
        rtfMessage.channel(RtfChannel.INTRA);
        rtfMessage.rtfType(RtfType.MANUAL);

        return rtfMessage.build();
    }

    @Override
    public CbsInstructionDto toDto(CbsInstruction cbsInstruction) {
        if (cbsInstruction == null) {
            return null;
        }

        String id = null;
        String clientTransactionId = null;

        id = cbsInstruction.id();
        clientTransactionId = cbsInstruction.clientTransactionId();

        String transactionCode = cbsInstruction.transactionCode().toString();

        CbsInstructionDto cbsInstructionDto =
                new CbsInstructionDto(id, clientTransactionId, transactionCode);

        return cbsInstructionDto;
    }

    @Override
    public List<CbsInstructionDto> toDtoList(List<CbsInstruction> cbsInstructions) {
        if (cbsInstructions == null) {
            return null;
        }

        List<CbsInstructionDto> list = new ArrayList<CbsInstructionDto>(cbsInstructions.size());
        for (CbsInstruction cbsInstruction : cbsInstructions) {
            list.add(toDto(cbsInstruction));
        }

        return list;
    }

    @Override
    public RtfPosting toRtfPosting(RtfAuthorizedPostingDto dto) {
        if (dto == null) {
            return null;
        }

        RtfPosting.RtfPostingBuilder rtfPosting = RtfPosting.builder();

        rtfPosting.amount(dto.amount());
        rtfPosting.isFee(dto.isFee());
        rtfPosting.type(dto.type());

        return rtfPosting.build();
    }

    @Override
    public RtfPosting toRtfPosting(RtfReversalPostingDto dto) {
        if (dto == null) {
            return null;
        }

        RtfPosting.RtfPostingBuilder rtfPosting = RtfPosting.builder();

        rtfPosting.clientTransactionId(dto.clientTransactionId());
        rtfPosting.isFee(dto.isFee());
        rtfPosting.type(dto.type());

        return rtfPosting.build();
    }

    protected List<RtfPosting> rtfAuthorizedPostingDtoListToRtfPostingList(
            List<RtfAuthorizedPostingDto> list) {
        if (list == null) {
            return null;
        }

        List<RtfPosting> list1 = new ArrayList<RtfPosting>(list.size());
        for (RtfAuthorizedPostingDto rtfAuthorizedPostingDto : list) {
            list1.add(toRtfPosting(rtfAuthorizedPostingDto));
        }

        return list1;
    }

    protected List<RtfPosting> rtfReversalPostingDtoListToRtfPostingList(
            List<RtfReversalPostingDto> list) {
        if (list == null) {
            return null;
        }

        List<RtfPosting> list1 = new ArrayList<RtfPosting>(list.size());
        for (RtfReversalPostingDto rtfReversalPostingDto : list) {
            list1.add(toRtfPosting(rtfReversalPostingDto));
        }

        return list1;
    }
}
