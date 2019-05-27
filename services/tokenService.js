// Import jwt Library
const jwt = require('jsonwebtoken');
// Import Token Secret
const secret = require('../config').secret;

module.exports.generateJWT = (email) => {
  const today = new Date(); // create new Date object
  const exp = new Date(today); // get today date
  exp.setDate(today.getDate() + 60); // set date
  return jwt.sign(
    {
      exp: parseInt(exp.getTime() / 1000), // set token expiration time to current date
      email: email
    },
    secret
  );
};
