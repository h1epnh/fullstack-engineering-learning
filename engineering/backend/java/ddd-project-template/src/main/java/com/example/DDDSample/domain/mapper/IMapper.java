package com.example.DDDSample.domain.mapper;

import java.util.List;

public interface IMapper<Object, Entity> {

    Object toObject(Entity entity);

    Entity toEntity(Object object);

    List<Object> toListObject(List<Entity> entities);
}