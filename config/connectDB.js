const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose.connect(url)
    .then(() => {
      console.log('Successfully connected to DB');
    })
}

module.exports = connectDB;