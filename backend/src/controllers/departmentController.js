const { getDB } = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const db = await getDB();
    const departments = await db.query('SELECT * FROM departments ORDER BY department_name ASC');
    return res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

module.exports = {
  getDepartments
};
