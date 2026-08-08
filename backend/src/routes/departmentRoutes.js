const express = require('express');
const router = express.Router();
const { getDepartments } = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getDepartments);

module.exports = router;
