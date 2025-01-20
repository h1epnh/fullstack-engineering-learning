package com.example.DDDSample.infastructure.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Health {

    @Id
    private String id;
}
