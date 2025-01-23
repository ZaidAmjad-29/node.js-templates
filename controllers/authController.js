const User = require('./../models/userModel');
const catchasync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchasync(async (req, res, next) => {
  //   const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  //   console.log(newUser);
  res.status(201).json({
    status: true,
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchasync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError('PLease provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  //   console.log(user);

  if (!user || !correct) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id);
  console.log(token)
  res.status(200).json({
    status: true,
    token,
  });
});
