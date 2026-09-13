package com.finx.payment_execution.infra.listener.settlement.mapper;

import com.finx.cbspojo.domain.RtfMessage;
import com.finx.cbspojo.domain.RtfPosting;
import com.finx.cbspojo.domain.RtfPostingType;
import com.finx.payment_execution.infra.listener.settlement.dto.SettlementMessageRequest;
import com.finx.payment_execution.infra.listener.settlement.dto.SettlementRtfPosting;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
        value = "org.mapstruct.ap.MappingProcessor",
        date = "2023-11-15T20:46:37+0700",
        comments =
                "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.35.0.v20230814-2020, environment: Java 17.0.8.1 (Eclipse Adoptium)")
@Component
public class SettlementMessageMapperImpl implements SettlementMessageMapper {

    @Override
    public RtfMessage toDomain(SettlementMessageRequest request) {
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
        rtfMessage.bankCode(request.bankCode());
        rtfMessage.cardNumber(request.cardNumber());
        rtfMessage.channel(request.channel());
        rtfMessage.countryCode(request.countryCode());
        rtfMessage.createdDate(request.createdDate());
        rtfMessage.currency(request.currency());
        if (request.forcePost() != null) {
            rtfMessage.forcePost(request.forcePost());
        }
        rtfMessage.fromAccount(request.fromAccount());
        rtfMessage.mcc(request.mcc());
        rtfMessage.narrative(request.narrative());
        rtfMessage.originalTransactionId(request.originalTransactionId());
        rtfMessage.postings(toRtfPosting(request.postings()));
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
    public RtfPosting toRtfPosting(SettlementRtfPosting settlementRtfPosting) {
        if (settlementRtfPosting == null) {
            return null;
        }

        RtfPosting.RtfPostingBuilder rtfPosting = RtfPosting.builder();

        rtfPosting.amount(settlementRtfPosting.amount());
        rtfPosting.clientTransactionId(settlementRtfPosting.clientTransactionId());
        rtfPosting.isFee(settlementRtfPosting.isFee());
        rtfPosting.type(settlementRtfPosting.type());

        return rtfPosting.build();
    }

    @Override
    public List<RtfPosting> toRtfPosting(List<SettlementRtfPosting> settlementRtfPosting) {
        if (settlementRtfPosting == null) {
            return null;
        }

        List<RtfPosting> list = new ArrayList<RtfPosting>(settlementRtfPosting.size());
        for (SettlementRtfPosting settlementRtfPosting1 : settlementRtfPosting) {
            list.add(toRtfPosting(settlementRtfPosting1));
        }

        return list;
    }
}
