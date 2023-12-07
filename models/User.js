const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
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

//to generate hashed password
userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

//Export the model
module.exports = mongoose.model('User', userSchema);