package com.example.DDDSample.infastructure.repository.database.persistence;

public enum DatabaseType {
    MYSQL("mysql"),
    POSTGRESQL("postgresql"),
    // Add other supported database types here
    ;

    private final String name;

    private DatabaseType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}