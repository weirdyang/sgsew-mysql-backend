const express = require('express');
const {
  addOptions,
  promisifiedGetOptionById,
  promisfiedGetOptions,
  promisfiedGetOptionsByCompanyId,
  promisifiedAddOptions,
} = require('../data/options.data');
const HttpError = require('../models/HttpError');

const router = express.Router();

/* GET options listing. */
router.get('/', async (req, res, next) => {
  try {
    const results = await promisfiedGetOptions();
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const results = await promisfiedGetOptionsByCompanyId(req.params.companyId);
    if (!results.length) {
      return next(new HttpError('no options linked to company id', 404));
    }
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});

router.get('/:optionId', async (req, res, next) => {
  try {
    const results = await promisifiedGetOptionById(req.params.optionId);
    if (!results.length) {
      return next(new HttpError('no such option', 404));
    }
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});
router.post('/add',
  async (req, res, next) => {
    // check if req is an array:
    if (!(req.body instanceof Array)) {
      return next(new HttpError('invalid input, data passed in must be an array', 422));
    }
    try {
      const results = await promisifiedAddOptions(req.body);
      return res.json(results);
    } catch (error) {
      return next(new HttpError(error.message, 500));
    }
  });

module.exports = router;
