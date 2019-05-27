// import validator class
const joi = require('joi');

// user login Schema and validations to be done
module.exports.login = joi.object().keys({
    email: joi
        .string()
        .email()
        .required(),
    password: joi.required(),
});

// user registration Schema and validations to be done
module.exports.newUser = joi.object().keys({
    email: joi
        .string()
        .email()
        .required(),
    password: joi.string()
        .min(6)
        .required(),
})