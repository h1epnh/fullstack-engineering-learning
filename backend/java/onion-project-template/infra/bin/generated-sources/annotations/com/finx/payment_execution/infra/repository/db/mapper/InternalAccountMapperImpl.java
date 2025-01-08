package com.finx.payment_execution.infra.repository.db.mapper;

import com.finx.payment_execution.core.domain.InternalAccountMapping;
import com.finx.payment_execution.infra.repository.db.entity.InternalAccountMappingEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
        value = "org.mapstruct.ap.MappingProcessor",
        date = "2023-11-15T20:46:37+0700",
        comments =
                "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.35.0.v20230814-2020, environment: Java 17.0.8.1 (Eclipse Adoptium)")
@Component
public class InternalAccountMapperImpl implements InternalAccountMapper {

    @Override
    public List<InternalAccountMapping> toDomainList(List<InternalAccountMappingEntity> entity) {
        if (entity == null) {
            return null;
        }

        List<InternalAccountMapping> list = new ArrayList<InternalAccountMapping>(entity.size());
        for (InternalAccountMappingEntity internalAccountMappingEntity : entity) {
            list.add(toDomain(internalAccountMappingEntity));
        }

        return list;
    }
}
