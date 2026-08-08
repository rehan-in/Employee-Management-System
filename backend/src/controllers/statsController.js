const { getDB } = require('../config/db');

// GET /api/stats/summary (Total employees & total departments)
const getTopMetrics = async (req, res) => {
  try {
    const db = await getDB();
    
    const empResult = await db.query('SELECT COUNT(*) as total_employees FROM employees');
    const deptResult = await db.query('SELECT COUNT(*) as total_departments FROM departments');
    const salaryResult = await db.query('SELECT AVG(salary) as avg_company_salary, SUM(salary) as total_payroll FROM employees');

    const totalEmployees = empResult[0].total_employees || empResult[0]['COUNT(*)'] || 0;
    const totalDepartments = deptResult[0].total_departments || deptResult[0]['COUNT(*)'] || 0;
    const avgSalary = salaryResult[0].avg_company_salary || 0;
    const totalPayroll = salaryResult[0].total_payroll || 0;

    return res.json({
      totalEmployees: Number(totalEmployees),
      totalDepartments: Number(totalDepartments),
      avgCompanySalary: Number(avgSalary),
      totalPayroll: Number(totalPayroll)
    });
  } catch (err) {
    console.error('Error fetching top metrics:', err);
    return res.status(500).json({ error: 'Failed to compute top dashboard metrics.' });
  }
};

// GET /api/stats/department-summary (Headcount and average salary per department via JOIN)
const getDepartmentStats = async (req, res) => {
  try {
    const db = await getDB();

    const sql = `
      SELECT 
        d.id as department_id,
        d.department_name,
        COUNT(e.id) as headcount,
        COALESCE(AVG(e.salary), 0) as avg_salary,
        COALESCE(SUM(e.salary), 0) as total_salary
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.department_name
      ORDER BY headcount DESC, d.department_name ASC
    `;

    const stats = await db.query(sql);

    // Format stats numbers cleanly
    const formattedStats = stats.map(row => ({
      departmentId: row.department_id,
      departmentName: row.department_name,
      headcount: Number(row.headcount || 0),
      avgSalary: Number(row.avg_salary || 0),
      totalSalary: Number(row.total_salary || 0)
    }));

    return res.json(formattedStats);
  } catch (err) {
    console.error('Error fetching department statistics:', err);
    return res.status(500).json({ error: 'Failed to compute department statistics.' });
  }
};

module.exports = {
  getTopMetrics,
  getDepartmentStats
};
