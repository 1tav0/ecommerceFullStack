const User = require('../models/User');


const register = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    //create a new user
    const newUser = await User.create(req.body);
    res.status(200).json({ newUser });
  } else {
    //User already exists
    res.status(422).json({ msg: "Email already in use", success: false });
  }
}

module.exports = {register}