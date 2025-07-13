// models/comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  text: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  emailID:{
    type: String,
  }
});

module.exports = mongoose.model('Comment', commentSchema);
