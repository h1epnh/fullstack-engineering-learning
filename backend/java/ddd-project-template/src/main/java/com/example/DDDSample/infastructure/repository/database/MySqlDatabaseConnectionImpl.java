package com.example.DDDSample.infastructure.repository.database;

import java.sql.Connection;
import java.sql.DriverManager;

public class MySqlDatabaseConnectionImpl implements DatabaseConnection {

    private String url;
    private String username;
    private String password;

    public MySqlDatabaseConnectionImpl(String url, String username, String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    @Override
    public Connection connect() throws Exception {
        // Connect to the database
        System.out.println("Connected to the database");
        DriverManager.registerDriver(new com.mysql.jdbc.Driver());
        return DriverManager.getConnection(url, username, password);

    }

    @Override
    public void disconnect() {
        // Disconnect from the database
        System.out.println("Disconnected from the database");
    }
}
