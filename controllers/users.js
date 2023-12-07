const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    //create a new user
    const newUser = await User.create(req.body);
    res.status(200).json({ newUser });
  } else {
    //User already exists
    // res.status(422).json({ msg: "Email already in use", success: false });
    throw new Error("User already exists");
  }
})

module.exports = {register}