const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');  // Adjusted path
const userRoutes = require('./routes/userRoutes');  // Adjusted path

dotenv.config();  // Load environment variables
connectDB();  // Connect to MongoDB

const app = express();
app.use(express.json());  // Middleware to parse JSON requests
app.use(require('cors')());  // Enable CORS

// API Routes
app.use('/api/users', userRoutes);  // User routes

// Root Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
