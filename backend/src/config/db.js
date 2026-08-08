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
    // Attempt MySQL Connection Pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'employee_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    console.log(`[Database] Connected to MySQL database (${process.env.DB_NAME}) on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
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
      const emps = [
        ['Alice Johnson', 'alice.j@company.com', '+1-555-0101', 95000.00, 1],
        ['Bob Smith', 'bob.s@company.com', '+1-555-0102', 65000.00, 2],
        ['Charlie Davis', 'charlie.d@company.com', '+1-555-0103', 88000.00, 3],
        ['Diana Prince', 'diana.p@company.com', '+1-555-0104', 110000.00, 1],
        ['Ethan Hunt', 'ethan.h@company.com', '+1-555-0105', 72000.00, 4],
        ['Fiona Gallagher', 'fiona.g@company.com', '+1-555-0106', 82000.00, 5]
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
