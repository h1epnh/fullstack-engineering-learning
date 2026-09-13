package com.example.DDDSample.infastructure.repository.database;

import com.example.DDDSample.infastructure.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    // Add a custom method to find books by author
    List<Book> findByAuthor(String author);
}
