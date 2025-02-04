
# PostgreSQL Cheatsheet

## Connecting to PostgreSQL
psql -h hostname -d database -U username -W

## Basic Commands
-- Connect to a database
\c database_name

-- List all databases
\l

-- List all tables in the current database
\dt

-- Describe a table
\d table_name

-- Quit psql
\q

## CRUD Operations

-- Create a table
CREATE TABLE table_name (
    column1 datatype PRIMARY KEY,
    column2 datatype,
    column3 datatype
);

-- Insert data into a table
INSERT INTO table_name (column1, column2, column3) VALUES (value1, value2, value3);

-- Select data from a table
SELECT * FROM table_name;

-- Update data in a table
UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition;

-- Delete data from a table
DELETE FROM table_name WHERE condition;

## Indexes

-- Create an index
CREATE INDEX index_name ON table_name (column_name);

-- Drop an index
DROP INDEX index_name;

## Users and Roles

-- Create a user
CREATE USER username WITH PASSWORD 'password';

-- Grant privileges to a user
GRANT ALL PRIVILEGES ON DATABASE database_name TO username;

-- Revoke privileges from a user
REVOKE ALL PRIVILEGES ON DATABASE database_name FROM username;

## Backup and Restore

-- Backup a database
pg_dump database_name > backup_file.sql

-- Restore a database
psql database_name < backup_file.sql