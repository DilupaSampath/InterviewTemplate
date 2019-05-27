const joi = require('joi');

// updatePump registration Schema and validations to be done
module.exports.updatePump = joi.object().keys({
    pumpId: joi.string().required(),
    name: joi.string().min(1).max(30),
    pS: joi.boolean(),
    duration: joi.number(),
    delayBetweenMainValves: joi.number(),
    mainValves: joi.array().items(
        joi.object().keys({
            valveID: joi.string().alphanum().min(24).max(24).required(),
            valveOrder: joi.number().required(),
            duration: joi.number().required(),
            status: joi.boolean().required()
        })
    ),
    sT: joi.array().items(
        joi.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    ),
    nutrient_id: joi.string(),
    seQuenceGap: joi.number().min(600)
});

// pumpId registration Schema and validations to be done
module.exports.pumpId = joi.object().keys({
    pumpId: joi.string().required()
});

// pumpStatus registration Schema and validations to be done
module.exports.pumpStatus = joi.object().keys({
    pumpId: joi.string().required(),
    status: joi.boolean().required(),
});

// mainValeStatus registration Schema and validations to be done
module.exports.mainValeStatus = joi.object().keys({
    mainValveId: joi.string().required(),
    status: joi.boolean().required(),
});