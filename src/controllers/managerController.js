const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Manager = require('../models/Manager'); // Manager model for the managers table
const User = require('../models/userModel'); // User model for the users table (students)
const Mess = require('../models/Mess'); // The Mess model

// Register a new manager
const registerManager = async (req, res) => {
  const { username, email, phoneNumber, password, role } = req.body;

  try {
    // Check if the manager already exists
    const existingManager = await Manager.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists', success: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new manager
    const newManager = new Manager({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      role: 'manager', // Explicitly set role to 'manager'
    });

    await newManager.save();

    res.status(201).json({ message: 'Manager registered successfully!', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Manager login
const loginManager = async (req, res) => {
  const { email, password } = req.body;

  try {
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found', success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password', success: false });
    }

    const token = jwt.sign(
      { userId: manager._id, role: manager.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message, success: false });
  }
};


// Register a new student (only for managers)
const registerStudent = async (req, res) => {
  const { username, email, phoneNumber, password } = req.body;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify and decode the token
    const token = authorization.startsWith('Bearer ')
      ? authorization.split(' ')[1]
      : authorization;

    console.log('Token received:', token); // Debugging log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded payload:', decoded); // Debugging log

    // Ensure the user performing the action is a manager
    const manager = await Manager.findById(decoded.userId);
    if (!manager) {
      return res.status(403).json({ message: 'Access forbidden', success: false });
    }

    // Check if the student already exists
    const existingStudent = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists', success: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save a new student
    const newStudent = new User({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await newStudent.save();

    // Add mess entries
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const messEntries = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      messEntries.push({
        userId: newStudent._id,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        breakfast: day < currentDay ? 0 : 1,
        dinner: day < currentDay ? 0 : 1,
      });
    }

    await Mess.insertMany(messEntries);

    res.status(201).json({ message: 'Student registered and mess entries created successfully', success: true });
  } catch (error) {
    console.error('Error in registerStudent:', error.message); // Debugging log
    res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
  }
};


// Delete a student (only for managers)
const deleteStudent = async (req, res) => {
  const { studentId } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify the authorization token
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);

    // Ensure the user performing the action is a manager
    const manager = await Manager.findById(decoded.userId);
    if (!manager) {
      return res.status(403).json({ message: 'Access forbidden', success: false });
    }

    // Delete the student from the users table
    const student = await User.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found', success: false });
    }

    res.status(200).json({ message: 'Student deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting student:', error); // Log the error for debugging
    res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
  }
};
const getMessStatusForToday = async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: 'Authorization token is required', success: false });
  }

  try {
    // Verify and decode the token
    const token = authorization.startsWith('Bearer ')
      ? authorization.split(' ')[1]
      : authorization;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the user performing the action is a manager
    const manager = await Manager.findById(decoded.userId);
    if (!manager) {
      return res.status(403).json({ message: 'Access forbidden', success: false });
    }

    // Get the current date (only date part, no time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch mess records for today
    const messRecords = await Mess.find({
      date: today,
      $or: [{ breakfast: 1 }, { dinner: 1 }],
    }).populate('userId', 'username email'); // Populate user details (username, email)

    if (!messRecords || messRecords.length === 0) {
      return res.status(404).json({ message: 'No mess records found for today', success: false });
    }

    // Prepare response
    const result = messRecords.map((record) => ({
      studentName: record.userId.username,
      email: record.userId.email,
      breakfast: record.breakfast === 1,
      dinner: record.dinner === 1,
    }));

    res.status(200).json({
      message: 'Mess status for today retrieved successfully',
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error retrieving mess status for today:', error.message); // Debugging log
    res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
  }
};


// Turn mess off for a student (only for managers)
const turnMessOff = async (req, res) => {
  const { studentId } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    const manager = await Manager.findById(decoded.userId);
    if (!manager) {
      return res.status(403).json({ message: 'Access forbidden', success: false });
    }

    // Find the student and turn mess off
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found', success: false });
    }

    student.messStatus = false; // Assuming messStatus field exists
    await student.save();

    res.status(200).json({ message: 'Mess turned off for student', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// Get all students (only for managers)
const getAllStudents = async (req, res) => {
    const { authorization } = req.headers;
  
    if (!authorization) {
      return res.status(403).json({ message: 'Authorization token is required', success: false });
    }
  
    try {
      console.log("Authorization header:", authorization);  // Log token to verify it's being sent correctly
      const token = authorization.split(' ')[1]; // Extract the token from the 'Bearer' prefix
  
      if (!token) {
        return res.status(403).json({ message: 'Authorization token is missing', success: false });
      }
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Fetch all students from the 'users' table
      const students = await User.find({});
  
      if (!students || students.length === 0) {
        return res.status(404).json({ message: 'No students found', success: false });
      }
  
      res.status(200).json({ students });
    } catch (error) {
      console.error('Token verification error:', error);  // Log error for better debugging
      res.status(500).json({ message: error.message, success: false });
    }
  };

  const getPendingMessRequests = async (req, res) => {
    try {
      const pendingRequests = await MessRequest.find({ status: 'pending' }).populate('userId', 'username email');
      if (!pendingRequests || pendingRequests.length === 0) {
        return res.status(404).json({ message: 'No pending requests found', success: false });
      }
  
      res.status(200).json({ message: 'Pending requests fetched successfully', success: true, requests: pendingRequests });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
    }
  };

const updateMessRequestStatus = async (req, res) => {
  const { requestId } = req.params; // The ID of the mess-off request
  const { status } = req.body; // New status: 'approved' or 'rejected'

  try {
    // Find the request by ID
    const messRequest = await MessRequest.findById(requestId);
    if (!messRequest) {
      return res.status(404).json({ message: 'Request not found', success: false });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status', success: false });
    }

    // Update the request status
    messRequest.status = status;
    await messRequest.save();

    if (status === 'approved') {
      // If approved, update the Mess table for the requested dates
      const { userId, mealType, startDate, endDate } = messRequest;

      // Convert dates to moment objects for iteration
      const start = moment(startDate);
      const end = moment(endDate);

      for (let date = start; date.isSameOrBefore(end, 'day'); date.add(1, 'day')) {
        // Update each day in the Mess table
        await Mess.updateOne(
          { userId, date: date.toDate() },
          {
            $set: {
              breakfast: mealType === 'breakfast' || mealType === 'both' ? 0 : 1,
              dinner: mealType === 'dinner' || mealType === 'both' ? 0 : 1,
            },
          },
          { upsert: true } // Create a record if it doesn't exist
        );
      }
    }

    res.status(200).json({ message: `Request ${status} successfully`, success: true });
  } catch (error) {
    console.error('Error updating mess-off request:', error);
    res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
  }
};

  
module.exports = {
  registerManager,
  loginManager,
  registerStudent,
  deleteStudent,
  turnMessOff,
  getAllStudents,
  getMessStatusForToday,
  getPendingMessRequests,
  updateMessRequestStatus,
};
