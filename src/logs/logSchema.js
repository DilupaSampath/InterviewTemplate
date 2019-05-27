const joi = require('joi');

// limit Schema and validations to be done
module.exports.limit = joi.object().keys({
    limit: joi.number().required(),
});