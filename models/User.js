const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const ObjectId = mongoose.Types.ObjectId
const crypto = require('crypto');
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});

//to generate hashed password
userSchema.pre('save', async function (next) {
    // if password is reset to a new one we have to hash it again else continue
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
//using the schema methods
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.createPasswordResetToken = async function () {
    // generate a random token string
    const resetToken = crypto.randomBytes(32).toString('hex');
    // hash the generated token string 
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest("hex");
    // give expiration time for the new hashed token
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; //10 minutes
    // return the unhashed reset token
    return resetToken;
}

//Export the model
module.exports = mongoose.model('User', userSchema);





















