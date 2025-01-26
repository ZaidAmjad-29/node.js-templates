const { query, json } = require('express');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

exports.cheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  console.log('top 5 cheap tours');
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  // console.log(queryObj);
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);
  // console.log(queryObj);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // console.log(JSON.parse(queryStr));

  let query = Tour.find(JSON.parse(queryStr));

  //sorting functionality in API
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
    // console.log(sortBy);
  } else {
    query = query.sort('-duration');
  }

  //field functionality in API
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    // console.log(fields);
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  //Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numTours = await Tour.countDocuments();
    if (skip >= numTours)
      return next(new AppError(`page doesn't exist..`, 404));
  }

  // const features = new APIfeatures(Tour.find(), req.query).filter();

  const allTours = await query;

  res.status(200).json({
    status: true,
    results: allTours.length,
    data: {
      allTours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: true,
    message: 'A new tour is created',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Tour not found with that id', 404));
  }
  const tour = await Tour.findById(req.params.id);
  // if (!tour) {
  //   return next(new AppError('No tour found', 404));
  // }
  res.status(200).json({
    status: true,
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Tour not found with that id', 404));
  }
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  // if (!tour) {
  //   return next(new AppError('No tour found', 404));
  // }
  res.status(200).json({
    status: true,
    data: {
      tour,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Tour not found with that id', 404));
  }
  const tour = await Tour.findByIdAndDelete(req.params.id);
  // if (!tour) {
  //   return next(new AppError('No tour found', 404));
  // }
  res.status(200).json({
    status: true,
  });
});
exports.getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }, // Fixed $gte
    },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: true,
    data: {
      stats,
    },
  });
});
