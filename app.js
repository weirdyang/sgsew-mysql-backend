// this must be required as early as possible
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const optionsRouter = require('./routes/options');
const HttpError = require('./models/HttpError');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/options', optionsRouter);
// error for unsupported routes (which we dont want to handle)
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  if (error instanceof HttpError) {
    const errorMessage = {
      message: error.message,
    };
    if (error.additionalInfo) {
      errorMessage.additionalInfo = error.additionalInfo;
    }
    return res.status(error.code).json(errorMessage);
  }
  res.status(500);
  return res.json({ message: error.message || 'An unknown error occured!' });
});
module.exports = app;
