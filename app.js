const rateLimit = require('express-rate-limit');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();

const tourRouter = require('./Routers/tourRouter');
const userRouter = require('./Routers/userRouter');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

app.use(helmet());

app.use(express.json({ limit: '10kb' }));

app.use(sanitize());

app.use(xss());

app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from the same IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
