const User = require('../models/userModel'); // Adjust path if necessary
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const menu = require('../models/menuModel'); 
const Mess = require('../models/Mess');
// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;

    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate phone number format for Pakistan
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Please use a valid Pakistani phone number (e.g., +923001234567)' });
    }

    // Check for existing user by email or phone number
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone number already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await newUser.save();

    // Get the current date and calculate the days in the month
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Prepare entries for the mess table
    const messEntries = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      messEntries.push({
        userId: newUser._id, // Reference the user's ID
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        breakfast: day < currentDay ? 0 : 1, // 0 for days before registration, 1 for days after or on registration
        dinner: day < currentDay ? 0 : 1, // 0 for days before registration, 1 for days after or on registration
      });
    }

    // Insert entries into the mess table
    await Mess.insertMany(messEntries);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while registering the user.' });
  }
};


// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid password',
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Fetch user by email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Fetch Menu for a Specific Day or All Days
const Menu = require('../models/menuModel'); // Adjust the path to your model file

const getMenu = async (req, res) => {
  try {
    // Fetch the entire week's menu from the Menu collection
    const menu = await Menu.find({});

    // Check if the menu exists
    if (!menu || menu.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu for the week not found.',
      });
    }

    // Send the menu in response
    res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu.',
      error: error.message,
    });
  }
};

module.exports = {
  getMenu,
};

const getMess = async (req, res) => {
  try {
    // Get the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Authorization: Bearer <token>

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is required',
        success: false,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(403).json({
        message: 'Invalid or expired token',
        success: false,
      });
    }

    // Find the mess records for the user using the decoded userId
    const messData = await Mess.find({ userId: decoded.userId });

    if (!messData || messData.length === 0) {
      return res.status(404).json({
        message: 'No mess data found for this user',
        success: false,
      });
    }

    // Return the mess data
    res.status(200).json({
      message: 'Mess data retrieved successfully',
      success: true,
      data: messData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


const moment = require('moment'); // Library to handle date operations
const MessRequest = require('../models/MessRequest');

const createMessRequest = async (req, res) => {
  const { userId, mealType, startDate, endDate } = req.body;

  try {
    const currentDate = moment(); // Get current date
    const start = moment(startDate); // Convert startDate to moment object
    const end = moment(endDate); // Convert endDate to moment object

    // Validate past dates
    if (start.isBefore(currentDate, 'day') || end.isBefore(currentDate, 'day')) {
      return res.status(400).json({ message: 'Cannot request for past dates', success: false });
    }

    // Validate start date is not after end date
    if (start.isAfter(end)) {
      return res.status(400).json({ message: 'Start date cannot be after end date', success: false });
    }

    // Save the request to the database
    const newRequest = new MessRequest({
      userId,
      mealType,
      startDate,
      endDate,
      status: 'pending',
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Mess-off request created successfully',
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error('Error creating mess-off request:', error);
    res.status(500).json({ message: 'An error occurred: ' + error.message, success: false });
  }
};
module.exports = {
  getMess,
  registerUser,
  loginUser,
  getUserByEmail,
  getMenu,
  createMessRequest,
};
