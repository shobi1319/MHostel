const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, // New login function
  getUserByEmail,
  getMenu
} = require('../controllers/userController'); // Ensure correct path

// Register a new user
router.post('/register', registerUser);

// User login
router.post('/login', loginUser); // Added login route

// Fetch a user by email
router.get('/user', getUserByEmail);
router.get('/menu', getMenu);
module.exports = router;
