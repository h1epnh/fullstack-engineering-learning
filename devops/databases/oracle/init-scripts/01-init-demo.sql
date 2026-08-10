-- Example initialization script
-- This file will be executed automatically on first database startup

-- Create a sample user
CREATE USER demo_user IDENTIFIED BY demo_password;

-- Grant necessary privileges
GRANT CONNECT, RESOURCE TO demo_user;
GRANT CREATE SESSION TO demo_user;
GRANT UNLIMITED TABLESPACE TO demo_user;

-- Create a sample table
CREATE TABLE demo_user.employees (
    employee_id NUMBER(6) PRIMARY KEY,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    email VARCHAR2(100),
    hire_date DATE,
    salary NUMBER(8,2)
);

-- Insert sample data
INSERT INTO demo_user.employees VALUES (1, 'John', 'Doe', 'john.doe@example.com', SYSDATE, 50000);
INSERT INTO demo_user.employees VALUES (2, 'Jane', 'Smith', 'jane.smith@example.com', SYSDATE, 60000);
INSERT INTO demo_user.employees VALUES (3, 'Bob', 'Johnson', 'bob.johnson@example.com', SYSDATE, 55000);

COMMIT;

-- Display confirmation
SELECT 'Initialization completed successfully!' AS status FROM DUAL;
