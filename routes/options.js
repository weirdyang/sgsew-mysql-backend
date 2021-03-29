const express = require('express');
const {
  getOptions, addOptions, getOptionsByCompanyId, getOptionsById,
} = require('../data/options.data');
const HttpError = require('../models/HttpError');

const router = express.Router();

/* GET options listing. */
router.get('/', async (req, res, next) => {
  try {
    const results = await getOptions();
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const results = await getOptionsByCompanyId(req.params.companyId);
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});

router.get('/:optionId', async (req, res, next) => {
  try {
    const results = await getOptionsById(req.params.optionId);
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
      const results = await addOptions(req.body);
      return res.json(results);
    } catch (error) {
      return next(new HttpError(error.message, 500));
    }
  });

module.exports = router;
