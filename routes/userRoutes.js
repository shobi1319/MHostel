const express = require('express');
const router = express.Router();
const { registerUser, updateOnboardingStatus, getUserByEmail } = require('../controllers/userController');  // Ensure correct path

// Register a new user
router.post('/register', registerUser);

// Update onboarding status for a user
router.put('/onboarding/:id', updateOnboardingStatus);

// Fetch a user by email
router.get('/user', getUserByEmail);

module.exports = router;
