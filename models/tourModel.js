const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({

  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour must have less or equal to 40 characters'],
    minlength: [10, 'A tour must have greater or equal to 10 characters'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either easy, medium, difficult',
    },
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    max: [5, 'A rating must be less than or equala to 5'],
    min: [1, 'A rating must be greater or equal to 1'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'Atour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

// tourSchema.pre('save', function () {
//   console.log(this);
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
