const mongoose = require('mongoose');

/**
 * Connect to MongoDB. Call and await before starting the HTTP server.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
}

module.exports = connectDB;
