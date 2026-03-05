const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in environment');
  try {
    // Mongoose 6+ uses sensible defaults; avoid deprecated driver options
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    throw err;
  }
};

module.exports = connectDB;
