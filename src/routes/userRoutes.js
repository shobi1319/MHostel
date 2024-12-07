const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, // New login function
  getUserByEmail,
  getMenu,
  getMess,
  createMessRequest,
} = require('../controllers/userController'); // Ensure correct path

// Register a new user
router.post('/register', registerUser);
router.post('messoff', createMessRequest);
// User login
router.post('/login', loginUser); // Added login route
router.post('/messoff, createMessRequest');
// Fetch a user by email
router.get('/user', getUserByEmail);
router.get('/menu', getMenu);
router.get('/mess', getMess);
module.exports = router;
