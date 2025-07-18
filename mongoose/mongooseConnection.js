// connectDB.js
require('dotenv').config(); 

//Variable
const mongo_URL = process.env.MONGO_URI
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const url = mongo_URL;

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Atlas Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
