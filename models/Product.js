const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    images: [],
    color: {
      type: String,
      required: true
    },
    brand:{
      type: String,
      required: true
    },
    sold:{
      type: Number,
      default: 0
    },
    ratings:[{
      star: Number,
      comment: String,
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
  }],
    totalRating:{
      type: String, 
      default: 0
    }
}, {timestamps: true});

//Export the model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;

//!mdbgum equivalent to rafce