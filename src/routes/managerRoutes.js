const express = require('express');

const router = express.Router();
const {
  registerManager,
  loginManager,
  registerStudent,
  deleteStudent,
  turnMessOff,
  getAllStudents,
  getMessStatusForToday,
  updateMessRequestStatus, // Add this route when you implement the mess request status update feature in your managerController
  getPendingMessRequests, // Add this route when you implement the pending mess requests feature in your managerController
} = require('../controllers/managerController'); // Ensure the correct path to your managerController

// Register a new manager (not inserted into mess table)
router.post('/register', registerManager);

// Manager login
router.post('/login', loginManager);

// Register a new student (only for managers)
router.post('/register-student', registerStudent);

// Delete a student (only for managers)
router.delete('/delete-student/:studentId', deleteStudent);

// Turn off the mess for a student (only for managers)
router.patch('/mess-request/:requestId', updateMessRequestStatus);

// Get all students (only for managers)
router.get('/students', getAllStudents);
router.get('/messtoday', getMessStatusForToday);
router.get('/mess-requests/pending', getPendingMessRequests);
module.exports = router;
