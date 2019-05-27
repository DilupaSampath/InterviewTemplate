const joi = require('joi');

// updateSensor  Schema and validations to be done
module.exports.updateSensor = joi.object().keys({
    deviceId: joi.string().alphanum().min(24).max(24).required(),
    minimumLimit: joi.number().min(10).max(10000),
    testMode: joi.boolean(),
    pS: joi.boolean(),
    noOfCylinders: joi.number(),
    location: joi.string(),
    name: joi.string()
});

// deviceSchema  and validations to be done
module.exports.deviceSchema = joi.object().keys({
    cL: joi.number().min(10).max(10000).required(),
    tM: joi.boolean().required(),
    pS: joi.boolean().required(),
    did: joi.string().required(),
});

// deviceId  Schema and validations to be done
module.exports.deviceId = joi.object().keys({
    deviceId: joi.string().alphanum().min(24).max(24).required()
});