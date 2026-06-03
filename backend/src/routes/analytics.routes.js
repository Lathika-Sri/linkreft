const express = require('express');
const { getUrlAnalytics, getDashboardStats, getPublicStats } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/url/:id', protect, getUrlAnalytics);
router.get('/public/:code', getPublicStats);

module.exports = router;