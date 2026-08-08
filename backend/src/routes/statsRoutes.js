const express = require('express');
const router = express.Router();
const { getTopMetrics, getDepartmentStats } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/metrics', getTopMetrics);
router.get('/department-summary', getDepartmentStats);

module.exports = router;
