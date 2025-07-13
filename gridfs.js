const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfs;

function initGridFS() {
  const conn = mongoose.connection;
  conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    console.log('✅ GridFSBucket initialized');
  });
}

function getGFS() {
  if (!gfs) throw new Error('GridFSBucket not initialized');
  return gfs;
}

module.exports = { initGridFS, getGFS };
