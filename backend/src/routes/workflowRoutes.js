const express = require('express');
const router = express.Router();
const {
    createWorkflow,
    getWorkflows,
    getWorkflow,
    updateWorkflow,
    deleteWorkflow,
} = require('../controllers/workflowController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const tenantResolver = require('../middlewares/tenantResolver');

// All routes require auth + tenant resolution
router.use(auth, tenantResolver);

router.route('/')
    .get(getWorkflows)
    .post(authorize('Admin'), createWorkflow);

router.route('/:id')
    .get(getWorkflow)
    .put(authorize('Admin'), updateWorkflow)
    .delete(authorize('Admin'), deleteWorkflow);

module.exports = router;
