package com.example.DDDSample.application.controller;

import com.example.DDDSample.infastructure.entity.Book;
import com.example.DDDSample.infastructure.repository.database.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {
    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // **--- CRUD operations ---**

    // Create (uses JpaRepository's save method)
    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    // Read by ID (uses JpaRepository's findById method)
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(book);
    }

    // Update (uses JpaRepository's save method)
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        Book existingBook = bookRepository.findById(id).orElseThrow();
        existingBook.setTitle(book.getTitle());
        existingBook.setAuthor(book.getAuthor());
        return ResponseEntity.ok(bookRepository.save(existingBook));
    }

    // Delete (uses JpaRepository's deleteById method)
//    @DeleteMapping("/{id}") ==> Bug 405 Method DELETE not allowed
    @RequestMapping(value = "/{id}",
            produces = "application/json",
            method=RequestMethod.DELETE)
    public void deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
    }


    // Custom method to get all books for a specific author
    @GetMapping("/byAuthor/{author}")
    public List<Book> getBooksByAuthor(@PathVariable String author) {
        return bookRepository.findByAuthor(author);
    }
}
