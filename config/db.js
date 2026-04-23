const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  mongoose.set("bufferCommands", false);

  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.warn("MONGODB_URI is missing. App started without database connection.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", error.message);
    return false;
  }
}

module.exports = connectDB;
