'use strict';

const { MongoClient } = require('mongodb');
const pdfParse = require('pdf-parse');

// ── Connection cache (reuse across warm invocations) ──────────────────
let cachedClient = null;

async function getMongoClient() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient;
  }
  const uri = process.env.COSMOS_DB_CONNECTION_STRING;
  if (!uri || uri.includes('<ACCOUNT_NAME>')) {
    throw new Error('COSMOS_DB_CONNECTION_STRING is not configured.');
  }
  const client = new MongoClient(uri, { tls: true, retryWrites: false });
  await client.connect();
  cachedClient = client;
  return client;
}

// ── Main Function ─────────────────────────────────────────────────────
module.exports = async function processClaimOcr(context, myBlob) {
  const blobName = context.bindingData.blobName;

  context.log(`[OCR Function] Triggered for blob: "${blobName}"`);
  context.log(`[OCR Function] Blob size: ${myBlob.length} bytes`);

  // 1. Extract text from the PDF buffer using pdf-parse
  let extractedText = '';
  let ocrStatus = 'failed';

  try {
    context.log('[OCR Function] Extracting text from PDF...');
    const pdfData = await pdfParse(myBlob);
    extractedText = pdfData.text ? pdfData.text.trim() : '';
    ocrStatus = 'completed';
    context.log(`[OCR Function] Text extracted successfully. Pages: ${pdfData.numpages}, Characters: ${extractedText.length}`);
  } catch (pdfErr) {
    context.log.error(`[OCR Function] PDF text extraction failed: ${pdfErr.message}`);
    extractedText = '';
    ocrStatus = 'failed';
    // Continue to update DB with failed status rather than crashing
  }

  // 2. Connect to Cosmos DB and update the matching Claim document
  let client;
  try {
    client = await getMongoClient();
    const dbName = process.env.COSMOS_DB_NAME || 'mono-insurance';
    const db = client.db(dbName);
    const claimsCollection = db.collection('claims');

    // The blobName is encoded in the pdfPath URL stored in the DB.
    // We match by checking if the pdfPath field ends with the blobName.
    const updateResult = await claimsCollection.updateOne(
      { pdfPath: { $regex: blobName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') } },
      {
        $set: {
          ocrText: extractedText,
          ocrStatus: ocrStatus,
          ocrProcessedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      context.log.warn(`[OCR Function] No claim found in DB matching blob: "${blobName}"`);
    } else {
      context.log(`[OCR Function] ✅ Claim updated. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
    }
  } catch (dbErr) {
    context.log.error(`[OCR Function] Database update failed: ${dbErr.message}`);
    throw dbErr; // Rethrow so Azure Functions runtime marks this as a failed execution
  }

  context.log(`[OCR Function] Finished processing blob: "${blobName}" | OCR Status: ${ocrStatus}`);
};
