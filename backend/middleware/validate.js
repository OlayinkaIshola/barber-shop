const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
      field: err.path || err.param, 
      message: err.msg,
      value: err.value 
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: extractedErrors
    });
  }
  
  next();
};

module.exports = validate;
