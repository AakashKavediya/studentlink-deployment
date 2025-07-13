const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  name: { type: String, required: true },
  image: {
    data: Buffer,        // Binary data of the image (for legacy, not used with GridFS)
    contentType: String  // MIME type of the image (for legacy, not used with GridFS)
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files',
    required: false
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);