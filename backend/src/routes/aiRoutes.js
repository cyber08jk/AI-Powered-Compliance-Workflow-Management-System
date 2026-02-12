const express = require('express');
const router = express.Router();
const { generateIssueSummary, getIssueSummaries } = require('../controllers/aiController');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

// All routes require auth + tenant resolution
router.use(auth, tenantResolver);

router.post('/summarize/:issueId', generateIssueSummary);
router.get('/summaries/:issueId', getIssueSummaries);

module.exports = router;
