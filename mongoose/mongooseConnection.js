// connectDB.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const url = 'mongodb+srv://aakashkavediya:HnT87YFWwBfdj4Tq@studentlinkdb.v43wlmr.mongodb.net/StudentLinkDB?retryWrites=true&w=majority&appName=StudentLinkdb';

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
