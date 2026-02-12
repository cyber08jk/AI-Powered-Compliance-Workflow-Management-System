const express = require('express');
const router = express.Router();
const { register, login, getMe, getUsers, createUser } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const tenantResolver = require('../middlewares/tenantResolver');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.get('/users', auth, tenantResolver, authorize('Admin', 'Manager'), getUsers);
router.post('/users', auth, tenantResolver, authorize('Admin'), createUser);

module.exports = router;
