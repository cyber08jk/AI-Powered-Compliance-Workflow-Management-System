const express = require('express');
const router = express.Router();
const {
    createIssue,
    getIssues,
    getIssue,
    updateIssue,
    transitionIssue,
    deleteIssue,
} = require('../controllers/issueController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const tenantResolver = require('../middlewares/tenantResolver');

// All routes require auth + tenant resolution
router.use(auth, tenantResolver);

router.route('/')
    .get(getIssues)
    .post(createIssue);

router.route('/:id')
    .get(getIssue)
    .put(updateIssue)
    .delete(authorize('Admin', 'Manager'), deleteIssue);

router.patch('/:id/transition', transitionIssue);

module.exports = router;
