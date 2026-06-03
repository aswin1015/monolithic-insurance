const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

// Helper: Upload buffer to Azure Blob Storage
const uploadToAzureBlob = async (fileBuffer, originalName, mimeType) => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'insurance-claims';

  if (!connectionString || connectionString.includes('<YOUR_ACCOUNT_NAME>')) {
    throw new Error(
      'Azure Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in your environment.'
    );
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists with public blob access
  await containerClient.createIfNotExists({ access: 'blob' });

  const blobName = `claim-${uuidv4()}-${originalName.replace(/\s+/g, '_')}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return { blobUrl: blockBlobClient.url, blobName };
};

// @desc    Submit a new claim with PDF (uploads to Azure Blob Storage)
// @route   POST /api/claims
// @access  Private
const submitClaim = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document for your claim.',
      });
    }

    const { policyId, claimAmount, reason } = req.body;

    if (!policyId || !claimAmount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Policy ID, claim amount, and reason are required.',
      });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    if (parseFloat(claimAmount) > policy.coverage) {
      return res.status(400).json({
        success: false,
        message: `Claim amount cannot exceed the policy coverage of ₹${policy.coverage.toLocaleString()}.`,
      });
    }

    // Upload PDF to Azure Blob Storage
    let blobUrl;
    try {
      ({ blobUrl } = await uploadToAzureBlob(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      ));
    } catch (azureErr) {
      return res.status(500).json({
        success: false,
        message: `File upload failed: ${azureErr.message}`,
      });
    }

    const claim = await Claim.create({
      user: req.user._id,
      policy: policyId,
      policyType: policy.type,
      claimAmount: parseFloat(claimAmount),
      reason,
      pdfPath: blobUrl,          // Full Azure Blob URL (publicly accessible)
      originalFileName: req.file.originalname,
      ocrStatus: 'pending',      // Azure Function will update this once OCR completes
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('policy', 'name type coverage premium')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully! Document OCR processing will begin shortly.',
      claim: populatedClaim,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's claims
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .populate('policy', 'name type coverage premium')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single claim
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policy', 'name type coverage premium')
      .populate('user', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    // Only the owner or an admin can view a claim
    if (
      claim.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Internal endpoint for Azure Function to update OCR result
// @route   POST /api/claims/internal/update-ocr
// @access  Internal (protected by OCR_SECRET)
const updateOcr = async (req, res) => {
  try {
    const apiKey = req.headers['x-ocr-secret'];
    if (!apiKey || apiKey !== process.env.OCR_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const { blobName, ocrText, ocrStatus } = req.body;
    if (!blobName) {
      return res.status(400).json({ success: false, message: 'blobName is required.' });
    }

    // Match the claim by checking if pdfPath contains the blobName
    // Populate user so we can return the email for notification
    const claim = await Claim.findOneAndUpdate(
      { pdfPath: { $regex: blobName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') } },
      { $set: { ocrText: ocrText || '', ocrStatus: ocrStatus || 'failed', ocrProcessedAt: new Date() } },
      { new: true }
    ).populate('user', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, message: `No claim found matching blob: ${blobName}` });
    }

    res.json({
      success: true,
      message: 'OCR result updated.',
      claimId: claim._id,
      ocrStatus: claim.ocrStatus,
      customerEmail: claim.user?.email || null,
      customerName: claim.user?.name || 'Customer',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitClaim, getMyClaims, getClaimById, updateOcr };
