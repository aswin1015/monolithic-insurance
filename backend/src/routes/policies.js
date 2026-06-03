const express = require('express');
const router = express.Router();
const { getAllPolicies, getPoliciesByType, getPolicyById } = require('../controllers/policyController');

router.get('/', getAllPolicies);
router.get('/type/:type', getPoliciesByType);
router.get('/:id', getPolicyById);

module.exports = router;
