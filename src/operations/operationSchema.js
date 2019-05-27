const joi = require('joi');

// mainValveID  Schema and validations to be done
module.exports.mainValveID = joi.object().keys({
    mainValveId: joi.string().alphanum().min(24).max(24)
});

// pumpID  Schema and validations to be done
module.exports.pumpID = joi.object().keys({
    pumpId: joi.string().alphanum().min(24).max(24).required()
});

// mainValveCalibration  Schema and validations to be done
module.exports.mainValveCalibration = joi.object().keys({
    mainValveId: joi.string().required(),
    value: joi.number().required()
});

// finishCalibration  Schema and validations to be done
module.exports.finishCalibration = joi.object().keys({
    mainValveId: joi.string().alphanum().min(24).max(24),
    duration: joi.number().required(),
    value: joi.number().required()
});