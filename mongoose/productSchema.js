const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    heading: {
        type: String,
        minlength: 5,
        maxlength: 100,
        required: true 
    },
    price:{
        type: Number,
        minlength:1,
        maxlength:4,
        require: true
    },
    condition:{
        type: String,
        require: true
    },
    description:{
        type: String,
        minlength:4,
        maxlength:150,
        require: false
    },
    category:{
        type: String,
        require: true
    },
    userName:{
        type:String,
        
    },
    ownerEmail: String,
    image:{
        type:String,
        require:true,
    }
    
})

module.exports = mongoose.model("products",productSchema)