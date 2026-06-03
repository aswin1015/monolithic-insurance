const express = require('express');
const router = express.Router();
const { submitClaim, getMyClaims, getClaimById, updateOcr } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/update-ocr', updateOcr);          // Internal: called by Azure Function
router.post('/', protect, upload.single('pdf'), submitClaim);
router.get('/my', protect, getMyClaims);
router.get('/:id', protect, getClaimById);

module.exports = router;
