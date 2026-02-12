const express = require('express');
const router = express.Router();
const { getAuditLogs, getEntityAuditLog } = require('../controllers/auditController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const tenantResolver = require('../middlewares/tenantResolver');

// All routes require auth + tenant resolution
router.use(auth, tenantResolver);

router.get('/', authorize('Admin', 'Manager'), getAuditLogs);
router.get('/entity/:entity/:entityId', getEntityAuditLog);

module.exports = router;
