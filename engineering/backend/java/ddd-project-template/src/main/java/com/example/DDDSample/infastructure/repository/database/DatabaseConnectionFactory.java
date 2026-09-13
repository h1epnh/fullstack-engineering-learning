package com.example.DDDSample.infastructure.repository.database;

import com.example.DDDSample.infastructure.repository.database.persistence.DatabaseType;

public class DatabaseConnectionFactory {
    public static DatabaseConnection getConnection(String databaseType) throws Exception {
        if (databaseType.equals(DatabaseType.MYSQL.getName())) {
            // Replace with your actual connection details
            return new MySqlDatabaseConnectionImpl("jdbc:mysql://localhost:3306/default", "root", "123456");
        } else if (databaseType.equals(DatabaseType.POSTGRESQL.getName())) {
            // Implement logic to create PostgreSqlDatabaseConnection
            return null; // Replace with actual implementation
        } else {
            throw new IllegalArgumentException("Unsupported database type: " + databaseType);
        }

    }
}
