const User = require('../models/userModel'); // Adjust path if necessary

// Register User
const registerUser = async (req, res) => {
  try {
    // Destructure request body to get user details
    const { username, email, phoneNumber } = req.body;

    // Check if any required field is missing
    if (!username || !email || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the phone number matches the Pakistan format
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Please use a valid Pakistani phone number (e.g., +923001234567)' });
    }

    // Check if user with the same email or phone number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone number already exists.' });
    }

    // Create a new user
    const newUser = new User({ username, email, phoneNumber });
    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while registering the user.' });
  }
};

// Update onboarding status
const updateOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.hasSeenOnboarding = true;
    await user.save();
    res.json({ message: 'Onboarding status updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = {
  registerUser,
  updateOnboardingStatus,
  getUserByEmail
};
