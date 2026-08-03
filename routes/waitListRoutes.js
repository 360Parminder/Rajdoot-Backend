const express = require('express');
const waitlistController = require('../controllers/waitlistController.js');
const authController = require('../controllers/authController.js')
const router = express.Router();

// Add to waitlist - Public route
router.post('/join', waitlistController.joinWaitlist);



// Get waitlist entry by ID
// router.get('/:id', auth, waitlistController.getWaitlistEntryById);

router.use(authController.protect, authController.restrictTo(['admin','developer']));


// View all waitlist entries - Admin only
router.get('/waitlist', waitlistController.getWaitlist);

// Update waitlist status - Admin only
router.put('/:userId', waitlistController.approveUser);

// Delete waitlist entry - Admin only
// router.delete('/:id', [auth, admin], waitlistController.deleteWaitlistEntry);

module.exports = router;
