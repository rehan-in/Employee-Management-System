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
    phone VARCHAR(20) NOT NULL,
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
-- Hash generated using bcrypt cost factor 10
INSERT INTO users (name, email, password) VALUES 
('Admin User', 'admin@company.com', '$2a$10$8K1p/a0dL1LXMIgoED.54.4jX63h/Vq.x2n/xQy/Vq2p.X.x2n/xQ')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Initial Employees
INSERT INTO employees (name, email, phone, salary, department_id) VALUES 
('Alice Johnson', 'alice.j@company.com', '+1-555-0101', 95000.00, 1),
('Bob Smith', 'bob.s@company.com', '+1-555-0102', 65000.00, 2),
('Charlie Davis', 'charlie.d@company.com', '+1-555-0103', 88000.00, 3),
('Diana Prince', 'diana.p@company.com', '+1-555-0104', 110000.00, 1),
('Ethan Hunt', 'ethan.h@company.com', '+1-555-0105', 72000.00, 4),
('Fiona Gallagher', 'fiona.g@company.com', '+1-555-0106', 82000.00, 5)
ON DUPLICATE KEY UPDATE id=id;
