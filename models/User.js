const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const ObjectId  = mongoose.Types.ObjectId
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
    role: {
        type: String,
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    },
    address: [
        {
            type: ObjectId,
            ref: "Address"
        }
    ],
    wishlist: [
        {
            type: ObjectId,
            ref: "Product"
        }
    ],
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

//to generate hashed password
userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
//using the schema methods
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//Export the model
module.exports = mongoose.model('User', userSchema);