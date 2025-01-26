const { promisify } = require('util');
const User = require('./../models/userModel');
const catchasync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
// const { propfind } = require('../Routers/tourRouter');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchasync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   role: req.body.role,
  // });

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
  // console.log(user.correctPassword(password, user.password));
  const correct = await user.correctPassword(password, user.password);

  // console.log(correct);

  if (!user || !correct) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id);
  // console.log(token);
  res.status(200).json({
    status: true,
    token,
  });
});

exports.protect = catchasync(async (req, res, next) => {
  //1) getting token and check if it's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }
  if (!token)
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  //2) verifify the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);
  // console.log(decode);
  //3) check if user still exists
  const freshUser = await User.findById(decode.id);
  console.log(freshUser);
  if (!freshUser)
    return next(
      new AppError(
        'The user belonging to this token does not longer exist',
        401
      )
    );

  //4) check if user has changed password after token was issued
  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password. PLease log in again!', 401)
    );
  }

  req.user = freshUser;
  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 401)
      );
    }
    next();
  };
};

exports.forgotPassword = catchasync(async (req, res, next) => {
  //check if user email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User with this email is not found.', 404));
  }

  //if yes , generate random token
  const resetToken = user.createPasswordresetToken();
  await user.save({ validateBeforeSave: false });

  //send this token bak to user with email

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;

  const message = `Forgot your password?? Put a PATCH request with your new password and confirmPassword to: ${resetUrl}. If you didn't forget your password then please ignore this email `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password token will expire in 10 mins.',
      message,
    });

    res.status(200).json({
      status: true,
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
  }
  return next(
    new AppError(
      'There was an error sending the email.PLease try again later!',
      500
    )
  );
});
exports.resetPassword = catchasync(async (req, res, next) => {
  //Get user based on the token

  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token or has expired', 400));
  }

  //changed the pasword for the user

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: true,
    token,
  });
});
