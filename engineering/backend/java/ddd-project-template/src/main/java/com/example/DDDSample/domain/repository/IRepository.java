package com.example.DDDSample.domain.repository;

import java.util.List;
import java.util.Optional;

public interface IRepository<T, K> {

    Optional<T> insert(T t);

    Optional<T> update(T t);

    boolean delete(K k);

    Optional<T> findByOne(K k);

    List<T> findAll();
}
