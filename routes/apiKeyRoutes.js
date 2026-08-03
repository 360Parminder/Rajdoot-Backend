const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authController = require('../controllers/authController');


router.use(authController.protect);

// Create new API key
router.post('/create-api-key', apiKeyController.generateApiKey);

// Update API key
router.put('/api-keys/:key', apiKeyController.updateApiKey);

// Delete API key
router.delete('/api-keys/:key', apiKeyController.deleteApiKey);

// Get all API keys
router.get('/view-api-keys', apiKeyController.getAllApiKeys);

module.exports = router;
