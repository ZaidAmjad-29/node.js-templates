const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...alllowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (alllowedFields.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: true,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //if user post for updating password , creates an error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword to update'
      ),
      400
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: true,
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: true,
    data: null,
  });
});

exports.newUser = (req, res) => {
  res.status(500).json({
    status: 'Internal server error',
    message: 'This route is not defined',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'Internal server error',
    message: 'This route is not defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Internal server error',
    message: 'This route is not defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Internal server error',
    message: 'This route is not defined',
  });
};
