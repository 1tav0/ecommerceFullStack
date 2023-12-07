const { generateToken } = require('../config/jwtToken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// create a user
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
});

// login a user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check is user exists
  const findUser = await User.findOne({ email: email });

  if (findUser && await findUser.isPasswordMatched(password)) {
    res.status(200).json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id)
     });
  } else {
    throw new Error("Invalid Credentials.");
  }
})

//update a user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id: userid } = req.params;
    // const updateUser = await User.findByIdAndUpdate(userid, {
    //   firstname: req?.body?.firstname,
    //   lastname: req?.body?.lastname,
    //   email: req?.body?.email,
    //   mobile: req?.body?.mobile
    // }, {
    //   new: true
    // });
    const updatedUser = await User.findByIdAndUpdate(userid, req.body, {
      new: true
    });
    res.status(200).json({ updatedUser });
  } catch (error) {
    throw new Error(error);
  }
})

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({});
    res.json({ getUsers });
  } catch (error) {
    throw new Error(error);
  }
}) 

// get a single user
const getUser = asyncHandler(async (req, res) => {
  try {
    const { id: userid } = req.params;
    const user = await User.findOne({ _id: userid });
    res.status(200).json({ user });
  } catch (error) {
    throw new Error(error);
  }
})

// delete a user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id: userid } = req.params;
    const user = await User.findOneAndDelete({ _id: userid });
    res.status(200).json({ user });
  } catch (error) {
    throw new Error(error);
  }
})
  
module.exports = {
  register,
  login,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser
}