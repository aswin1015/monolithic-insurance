const Policy = require('../models/Policy');

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true }).sort({ type: 1, premium: 1 });
    res.json({ success: true, count: policies.length, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get policies by type
// @route   GET /api/policies/type/:type
// @access  Public
const getPoliciesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['car', 'health', 'life'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy type. Must be car, health, or life.',
      });
    }

    const policies = await Policy.find({ type, isActive: true }).sort({ premium: 1 });
    res.json({ success: true, count: policies.length, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single policy
// @route   GET /api/policies/:id
// @access  Public
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }
    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllPolicies, getPoliciesByType, getPolicyById };
