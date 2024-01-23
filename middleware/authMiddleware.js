const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        //console.log(decoded);
        const user = await User.findById(decoded?.id);
        req.user = user;
        //console.log(req.user);
        next();
      }
    } catch (error) {
      throw new Error("Not authorized, token expired, Please Login again");
    }
  } else {
    throw new Error('There is no token attached to header');
  }
});

// const authenticationMiddleware = asyncHandler(async (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization || !authorization.startsWith("Bearer")) {
//     throw new Error("There is no token attached to the headers");
//   }

//   const token = authorization.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_KEY);
//     const { id } = decoded;
//     const user = await User.findById(id);
//     req.user = user;
//     next();

//   } catch (error) {
//     throw new Error("Not authorized, token expired, Please Login again")
//   }
// })

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email: email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
})

module.exports = {
  authMiddleware,
  isAdmin
};


//for postman and authorization token header
//const jsonData = pm.response.json()
//pm.globals.set("accessToken", jsonData.token)


