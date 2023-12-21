const { generateToken } = require('../config/jwtToken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const validateMongoDBId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./email');

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
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(findUser?._id, {
      refreshToken: refreshToken
    }, {
      new: true
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    });
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

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  const refreshToken = cookie?.refreshToken;
  if (!refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }
  console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("No Refresh Token present in db or not matched");
  }
  jwt.verify(refreshToken, process.env.JWT_KEY, (err, decoded) => {
    if (err || user.id != decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  })
})

//logout user
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate({refreshToken:refreshToken}, {
    refreshToken: ""
  }, {
    new: true
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true
  })
  res.sendStatus(204); //forbidden
})

//update a user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { _id: userid } = req.user;
    validateMongoDBId(userid);
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
    validateMongoDBId(userid);
    const user = await User.findOne({ _id: userid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    throw new Error(error);
  }
})

// delete a user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id: userid } = req.params;
    validateMongoDBId(userid);
    const user = await User.findOneAndDelete({ _id: userid });
    res.status(200).json({ user });
  } catch (error) {
    throw new Error(error);
  }
})
  
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const blockedUser = await User.findByIdAndUpdate(id, {
      isBlocked: true
    }, {
      new: true
    })
    res.status(200).json({ message: "User Blocked", blockedUser });
  } catch (error) {
    throw new Error(error);
  }
})

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const unblock = User.findByIdAndUpdate(id, {
      isBlocked: false
    }, {
      new: true
    })
    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    throw new Error(error);
  }
})

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {password} = req.body;
  validateMongoDBId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No user with email exists");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save(); // need this bc of how we defined createPasswordResetToken()
    const resetURL = `Hi, please follow this link to reset your password. This link is valid till 10 minutes from now.<a href='http://localhost:3000/api/user/reset-password/${token}'>Click here</a>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL
    };
    await sendEmail(data);
    res.json(token);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
})

module.exports = {
  register,
  login,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken
}