const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

router.get('/', auth, tenantResolver, getDashboardStats);

module.exports = router;
