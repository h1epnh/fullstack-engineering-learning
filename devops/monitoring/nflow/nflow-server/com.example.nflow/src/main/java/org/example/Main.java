package org.example;

import io.nflow.jetty.StartNflow;
import io.nflow.server.spring.NflowStandardEnvironment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");

        String url = "jdbc:postgresql://localhost:5432/nflow";
        String user = "admin";
        String password = "12345abcd;;";

        try (Connection connection = DriverManager.getConnection(url, user, password)) {
            if (connection != null) {
                System.out.println("Connected to the PostgreSQL server successfully.");
            } else {
                System.out.println("Failed to make connection!");
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }


        // Initialize the properties map
        Map<String, Object> properties = new HashMap<>();
        properties.put("nflow.db.driver", "org.postgresql.Driver");
        properties.put("nflow.db.url", "jdbc:postgresql://localhost:5432/nflow");
        properties.put("nflow.db.user", "admin");
        properties.put("nflow.db.password", "12345abcd;;");

        // Set up the nFlow environment
        NflowStandardEnvironment environment = new NflowStandardEnvironment(properties);



        try {
            StartNflow.main(new String[] {
                "--port=7500", // Configure the port
                "--nflow.environment=" + environment
            });
            System.out.println("nFlow server running on port 7500");
        } catch (Exception e) {
            e.printStackTrace();
        }
//        new StartNflow().startJetty(7500, "local", "");
    }
}