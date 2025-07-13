const mongoose = require("mongoose");

const SignUpSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    emailID:String,
    password:String,
})

module.exports = mongoose.model('users',SignUpSchema)