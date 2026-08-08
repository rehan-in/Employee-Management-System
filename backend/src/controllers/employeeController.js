const { getDB } = require('../config/db');

// GET /api/employees?search=...&department_id=...
const getEmployees = async (req, res) => {
  try {
    const { search, department_id } = req.query;
    const db = await getDB();

    let sql = `
      SELECT e.id, e.name, e.email, e.phone, e.salary, e.department_id, e.created_at,
             d.department_name
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` AND e.name LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    if (department_id && department_id.trim() !== '' && department_id !== 'all') {
      sql += ` AND e.department_id = ?`;
      params.push(parseInt(department_id, 10));
    }

    sql += ` ORDER BY e.id DESC`;

    const employees = await db.query(sql, params);
    return res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    return res.status(500).json({ error: 'Failed to fetch employees.' });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const sql = `
      SELECT e.id, e.name, e.email, e.phone, e.salary, e.department_id, e.created_at,
             d.department_name
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `;
    const employees = await db.query(sql, [id]);

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    return res.json(employees[0]);
  } catch (err) {
    console.error('Error fetching employee by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch employee details.' });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, salary, department_id } = req.body;

    if (!name || !email || !phone || !salary || !department_id) {
      return res.status(400).json({ error: 'All fields (name, email, phone, salary, department_id) are required.' });
    }

    const db = await getDB();

    // Verify department exists
    const depts = await db.query('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (!depts || depts.length === 0) {
      return res.status(400).json({ error: 'Invalid department ID specified.' });
    }

    // Check unique email
    const existing = await db.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'An employee with this email already exists.' });
    }

    const sql = `
      INSERT INTO employees (name, email, phone, salary, department_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [name, email, phone, parseFloat(salary), parseInt(department_id, 10)]);

    const newId = result.insertId || result.id;
    const newEmployee = await db.query(
      `SELECT e.*, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.id = ?`,
      [newId]
    );

    return res.status(201).json({
      message: 'Employee created successfully.',
      employee: newEmployee[0]
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ error: 'Failed to create employee record.' });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, salary, department_id } = req.body;

    if (!name || !email || !phone || !salary || !department_id) {
      return res.status(400).json({ error: 'All fields (name, email, phone, salary, department_id) are required.' });
    }

    const db = await getDB();

    // Check employee exists
    const existingEmp = await db.query('SELECT id FROM employees WHERE id = ?', [id]);
    if (!existingEmp || existingEmp.length === 0) {
      return res.status(404).json({ error: 'Employee record not found.' });
    }

    // Verify department exists
    const depts = await db.query('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (!depts || depts.length === 0) {
      return res.status(400).json({ error: 'Invalid department ID specified.' });
    }

    // Check unique email for other employees
    const emailCheck = await db.query('SELECT id FROM employees WHERE email = ? AND id != ?', [email, id]);
    if (emailCheck && emailCheck.length > 0) {
      return res.status(400).json({ error: 'Another employee with this email already exists.' });
    }

    const sql = `
      UPDATE employees
      SET name = ?, email = ?, phone = ?, salary = ?, department_id = ?
      WHERE id = ?
    `;
    await db.query(sql, [name, email, phone, parseFloat(salary), parseInt(department_id, 10), id]);

    const updatedEmployee = await db.query(
      `SELECT e.*, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.id = ?`,
      [id]
    );

    return res.json({
      message: 'Employee updated successfully.',
      employee: updatedEmployee[0]
    });
  } catch (err) {
    console.error('Error updating employee:', err);
    return res.status(500).json({ error: 'Failed to update employee record.' });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const existingEmp = await db.query('SELECT id, name FROM employees WHERE id = ?', [id]);
    if (!existingEmp || existingEmp.length === 0) {
      return res.status(404).json({ error: 'Employee record not found.' });
    }

    // Execute delete cleanly handling referential integrity
    await db.query('DELETE FROM employees WHERE id = ?', [id]);

    return res.json({
      message: `Employee "${existingEmp[0].name}" (ID: ${id}) deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Cannot delete employee due to existing foreign key dependencies.' });
    }
    return res.status(500).json({ error: 'Failed to delete employee record.' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
