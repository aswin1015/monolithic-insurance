const express = require('express');
const router = express.Router();
const { getAllClaims, updateClaimStatus, getStats, getAllUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/claims', getAllClaims);
router.patch('/claims/:id', updateClaimStatus);
router.get('/users', getAllUsers);

module.exports = router;
