package com.example.DDDSample.infastructure.entity;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Type;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@MappedSuperclass
@SuperBuilder
public abstract class BaseEntity {

    private UUID Id;
}
