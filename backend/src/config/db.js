const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

let dbClient = null;
let dbType = 'mysql';

async function initDB() {
  try {
    // =========================================================================
    // Step 1: Bootstrap connection to MySQL Server (without database selected)
    // Ensures the target database exists or creates it if not already present.
    // =========================================================================
    const bootstrapConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 5000
    });

    const targetDbName = process.env.DB_NAME || 'employee_db';
    // Create database if not exists
    await bootstrapConn.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\``);
    await bootstrapConn.end();

    // =========================================================================
    // Step 2: Initialize MySQL Connection Pool targeting the database
    // =========================================================================
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: targetDbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection from pool
    const connection = await pool.getConnection();
    connection.release();

    // =========================================================================
    // Step 3: Ensure tables and seed data exist in MySQL
    // =========================================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        salary DECIMAL(12, 2) NOT NULL,
        department_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Seed initial Admin User if users table is empty
    const [usersCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await pool.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Admin User', 'admin@company.com', hashedPassword]
      );
    }

    // Seed default departments if departments table is empty
    const [deptsCount] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (deptsCount[0].count === 0) {
      const depts = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations'];
      for (const d of depts) {
        await pool.execute('INSERT INTO departments (department_name) VALUES (?)', [d]);
      }
    }

    console.log(`[Database] Successfully connected to MySQL database (${targetDbName}) on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    dbType = 'mysql';
    dbClient = {
      query: async (sql, params = []) => {
        const [rows] = await pool.execute(sql, params);
        return rows;
      }
    };
    return dbClient;
  } catch (mysqlErr) {
    console.warn(`[Database] MySQL connection failed (${mysqlErr.message}). Initializing embedded SQLite database fallback...`);
    
    // SQLite Fallback
    const dbPath = path.join(__dirname, '..', '..', 'employee_db.sqlite');
    const sqliteDb = new sqlite3.Database(dbPath);

    const runSqlite = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          sqliteDb.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ insertId: this.lastID, affectedRows: this.changes });
          });
        }
      });
    };

    // Initialize Schema & Seed Data for SQLite
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        salary REAL NOT NULL,
        department_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    // Seed Data if empty
    const usersCount = await runSqlite(`SELECT COUNT(*) as count FROM users`);
    if (usersCount[0].count === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await runSqlite(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        ['Admin User', 'admin@company.com', hashedPassword]
      );
    }

    const deptsCount = await runSqlite(`SELECT COUNT(*) as count FROM departments`);
    if (deptsCount[0].count === 0) {
      const depts = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations'];
      for (const d of depts) {
        await runSqlite(`INSERT INTO departments (department_name) VALUES (?)`, [d]);
      }
    }

    const empCount = await runSqlite(`SELECT COUNT(*) as count FROM employees`);
    if (empCount[0].count === 0) {
      // Seed initial employees with phone numbers formatted as digits only (optional leading +)
      const emps = [
        ['Alice Johnson', 'alice.j@company.com', '+15550101001', 95000.00, 1],
        ['Bob Smith', 'bob.s@company.com', '+15550101002', 65000.00, 2],
        ['Charlie Davis', 'charlie.d@company.com', '+15550101003', 88000.00, 3],
        ['Diana Prince', 'diana.p@company.com', '+15550101004', 110000.00, 1],
        ['Ethan Hunt', 'ethan.h@company.com', '+15550101005', 72000.00, 4],
        ['Fiona Gallagher', 'fiona.g@company.com', '+15550101006', 82000.00, 5]
      ];
      for (const emp of emps) {
        await runSqlite(
          `INSERT INTO employees (name, email, phone, salary, department_id) VALUES (?, ?, ?, ?, ?)`,
          emp
        );
      }
    }

    console.log(`[Database] Embedded SQLite database initialized at ${dbPath}`);
    dbType = 'sqlite';
    dbClient = {
      query: runSqlite
    };
    return dbClient;
  }
}

async function getDB() {
  if (!dbClient) {
    await initDB();
  }
  return dbClient;
}

module.exports = {
  getDB,
  getDbType: () => dbType
};
