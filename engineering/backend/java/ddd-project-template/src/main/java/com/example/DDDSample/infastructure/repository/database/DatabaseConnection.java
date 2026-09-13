package com.example.DDDSample.infastructure.repository.database;

import java.sql.Connection;
import java.sql.DriverManager;

public interface DatabaseConnection {
    public Connection connect() throws Exception;
    public void disconnect() throws Exception;
}


