const catchasync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Review = require('../models/reviewModel');

exports.createReview = catchasync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: true,
    message: 'A new review has been created',
    data: {
      Reviews: newReview,
    },
  });
});

exports.getAllReviews = catchasync(async (req, res, next) => {
  const allReviews = await Review.find();
  res.status(200).json({
    status: true,
    results: allReviews.length,
    data: {
      allReviews,
    },
  });
});
