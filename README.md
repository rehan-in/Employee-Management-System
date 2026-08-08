# Employee Management System

A full-stack Employee Management System built with a relational **MySQL** database, a secure **Node.js / Express REST API** with JWT authentication, and a modern **React + Vite** frontend dashboard featuring glassmorphic design aesthetics.

---

## Features

- **JWT Authentication**: User login with hashed passwords (`bcryptjs`). All API endpoints are guarded via JWT middleware.
- **Executive Dashboard**: Top-level metrics showing total workforce, total departments, average employee salary, and annual payroll.
- **Department-wise Statistics**: SQL `JOIN` aggregation displaying headcount and average salary per department.
- **Employee CRUD**: Complete interface and RESTful APIs to Add, Edit, and Delete employees with foreign key referential integrity checks.
- **Search & Filter**: Real-time searching by employee name and filtering by department ID.
- **Modern Glassmorphic UI**: Built with a sleek dark theme (`#090d16`), responsive CSS grid/flex layouts, custom badges, and micro-animations.

---

## Database Schema (MySQL)

Located in `database/schema.sql`:

1. **`users`**: `id` (PK), `name`, `email` (UNIQUE), `password` (hashed)
2. **`departments`**: `id` (PK), `department_name` (UNIQUE)
3. **`employees`**: `id` (PK), `name`, `email` (UNIQUE), `phone`, `salary` (DECIMAL), `department_id` (FK references `departments.id` `ON DELETE RESTRICT ON UPDATE CASCADE`)

Performance indexes are created on `employees(name)` and `employees(department_id)`.
