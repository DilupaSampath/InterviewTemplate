// import validator class
const joi = require('joi');
// import json web token library
const jwt = require('jsonwebtoken');
// import json web token secret
const secret = require('../config').secret;
// import response class
const response = require('./responseService');

/**
 * validate the API request body according to the schema defined and validate the token
 * @return validation Status
 * @param {*} schema , header tokens
 */
module.exports.validateBodyWithToken = function (schema) {
  return (req, res, next) => {
    // extract headers from request and return
    function getTokenFromHeader() {
      if (
        (req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer')
      ) {
        return req.headers.authorization.split(' ')[1];
      }
      return null;
    }
    // verify token and check the expiration time.
    jwt.verify(getTokenFromHeader(), secret, function (err, decoded) {
      if (err) {
        return response.customError('Invalid Token', res);
      } else {
        const result = joi.validate(req.body, schema);
        if (result.error) {
          return response.customError(
            result.error.details[0].message,
            res
          );
        } else {
          next();
        }
      }
    });
  };
};

/**
 * validate the API request body according to the schema defined
 * @return validation Status
 * @param {*} schema
 */
module.exports.validateBody = function (schema) {
  return (req, res, next) => {
    // validate the API request body according to the schema defined
    const result = joi.validate(req.body, schema);
    if (result.error) {
      return response.customError(result.error.details[0].message, res);
    } else {
      next();
    }
  };
};
/**
 * validate the API request headder
 * @return validation Status
 * @param {*} schema
 */
module.exports.validateHeader = function (schema) {
  return (req, res, next) => {
    // extract headers from request and return
    function getTokenFromHeader() {
      if (
        (req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer')
      ) {
        return req.headers.authorization.split(' ')[1];
      }
      return null;
    }
    // verify token and check the expiration time.
    jwt.verify(getTokenFromHeader(), secret, function (err, decoded) {
      if (err) {
        return response.customError('Invalid Token', res);
      } else {
        next();
      }
    });
  };
};

/**
 * Get JWT token from the request header
 * @param req
 * @return {*}
 */
module.exports.getTokenFromHeader = (req) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

/**
 * Get JWT token's payload information
 */
module.exports.getTokenInfo = (req) => {
  return jwt.verify(this.getTokenFromHeader(req), secret);
};
