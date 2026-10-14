-- ========================================================
-- Employee Management System Database Schema Script
-- MySQL 8.0+ Compatible
-- ========================================================

CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,

    -- =================== fixing the problem of phone No. =====================
    
    -- Allows only digits, optional leading +, and length between 10 and 15 digits
    phone VARCHAR(15) NOT NULL,
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[+]?[0-9]{10,15}$'),
    salary DECIMAL(12, 2) NOT NULL,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Indexes for performance on Search & Filter
CREATE INDEX idx_employee_name ON employees(name);
CREATE INDEX idx_employee_department ON employees(department_id);

-- Seed Initial Departments
INSERT INTO departments (department_name) VALUES 
('Engineering'),
('Human Resources'),
('Finance'),
('Marketing'),
('Operations')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Admin User (Email: admin@company.com | Password: Admin@123)
-- Valid bcrypt hash for password 'Admin@123' generated with cost factor 10
INSERT INTO users (name, email, password) VALUES 
('Admin User', 'admin@company.com', '$2a$10$A03MSy0W5l8HW1IPcQSGvuWbKqSF5iDlSHd5CBmyz3A6CCc6OXb92')
ON DUPLICATE KEY UPDATE password=VALUES(password);

-- Seed Initial Employees (Phones formatted with country code and digits only, matching chk_phone_format)
INSERT INTO employees (name, email, phone, salary, department_id) VALUES 
('Alice Johnson', 'alice.j@company.com', '+15550101001', 95000.00, 1),
('Bob Smith', 'bob.s@company.com', '+15550101002', 65000.00, 2),
('Charlie Davis', 'charlie.d@company.com', '+15550101003', 88000.00, 3),
('Diana Prince', 'diana.p@company.com', '+15550101004', 110000.00, 1),
('Ethan Hunt', 'ethan.h@company.com', '+15550101005', 72000.00, 4),
('Fiona Gallagher', 'fiona.g@company.com', '+15550101006', 82000.00, 5)
ON DUPLICATE KEY UPDATE id=id;
