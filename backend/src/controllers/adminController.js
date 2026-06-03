const Claim = require('../models/Claim');
const User = require('../models/User');

// @desc    Get all claims (admin)
// @route   GET /api/admin/claims
// @access  Admin
const getAllClaims = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.policyType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Claim.countDocuments(query);
    const claims = await Claim.find(query)
      .populate('user', 'name email phone')
      .populate('policy', 'name type coverage premium')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      claims,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update claim status (admin)
// @route   PATCH /api/admin/claims/:id
// @access  Admin
const updateClaimStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('policy', 'name type coverage premium')
      .populate('reviewedBy', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    res.json({
      success: true,
      message: `Claim status updated to "${status}".`,
      claim,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
  try {
    const [totalClaims, pendingClaims, approvedClaims, rejectedClaims, totalUsers] =
      await Promise.all([
        Claim.countDocuments(),
        Claim.countDocuments({ status: 'pending' }),
        Claim.countDocuments({ status: 'approved' }),
        Claim.countDocuments({ status: 'rejected' }),
        User.countDocuments({ role: 'user' }),
      ]);

    const claimsByType = await Claim.aggregate([
      { $group: { _id: '$policyType', count: { $sum: 1 }, totalAmount: { $sum: '$claimAmount' } } },
    ]);

    const recentClaims = await Claim.find()
      .populate('user', 'name email')
      .populate('policy', 'name type')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        totalUsers,
        claimsByType,
        recentClaims,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllClaims, updateClaimStatus, getStats, getAllUsers };
