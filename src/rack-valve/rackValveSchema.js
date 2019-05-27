const joi = require('joi');

// newRack registration Schema and validations to be done
module.exports.newRack = joi.object().keys({
  DeviceId: joi.string().required(),
  wT: joi
    .number()
    .min(1)
    .max(30)
    .required(),
  dT: joi.number().required(),
  Location: joi
    .string()
    .trim()
    .alphanum()
    .min(1)
    .required(),
  RackName: joi
    .string()
    .trim()
    .alphanum()
    .min(1)
    .required(),
  LineNumber: joi
    .string()
    .trim()
    .alphanum()
    .min(1)
    .required(),
  status: joi.boolean().required(),
  channel: joi.number().min(1),
  pS: joi.boolean().required()
});

// updateRack registration Schema and validations to be done
module.exports.updateRack = joi.object().keys({
  DeviceId: joi.string().required(),
  wT: joi.number().min(1),
  dT: joi.number().min(1),
  Location: joi
    .string()
    .trim()
    .alphanum()
    .min(1),
  RackName: joi
    .string()
    .trim()
    .min(1),
  LineNumber: joi
    .string()
    .trim()
    .alphanum()
    .min(1),
  channel: joi.number().min(1),
  pS: joi.boolean(),
  associatedWithMainValve: joi.boolean()
});

// deviceID registration Schema and validations to be done
module.exports.deviceID = joi.object().keys({
  deviceId: joi.string().required()
});
