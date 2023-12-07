const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true, "Please provide a first name"],
    },
    lastname:{
      type:String,
      required:[true, "Please provide a last name"],
    },
    email:{
        type:String,
        required:[true, "Please provide an email"],
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
    },
});

//Export the model
module.exports = mongoose.model('User', userSchema);