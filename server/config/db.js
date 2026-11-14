const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/traverse';
  if (uri.startsWith('mongodb+srv://') && uri.endsWith('/')) {
    uri = `${uri}traverse?retryWrites=true&w=majority`;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout accommodates cloud handshakes (e.g. Atlas on Render)
    });
    isConnected = true;
    console.log(`[Traverse DB] MongoDB connected successfully to: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Traverse DB] Note: Local MongoDB server is not running or not reachable (${error.message}).`);
    console.log(`[Traverse DB] Seamless in-memory & persisted fallback storage activated automatically with demo users, trips & chat.`);
    return false;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };

