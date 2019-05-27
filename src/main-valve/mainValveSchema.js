const joi = require('joi');

// updateValve registration Schema and validations to be done
module.exports.updateValve = joi.object().keys({
  mainValveId: joi.string().required(),
  name: joi
    .string()
    .min(1)
    .max(30),
  pS: joi.boolean(),
  rack: [
    joi
      .string()
      .alphanum()
      .min(24)
      .max(24),
    joi.allow(null)
  ],
  associatedWithPump: joi.boolean(),
  active: joi.boolean()
});

// mainValveID registration Schema and validations to be done
module.exports.mainValveID = joi.object().keys({
  mainValveId: joi.string().required()
});

// rackID registration Schema and validations to be done
module.exports.mainValveFunction = joi.object().keys({
    rackId: joi.string().alphanum().min(24).max(24),
    status: joi.boolean().required()
});

// mainValveStatus registration Schema and validations to be done
module.exports.mainValveStatus = joi.object().keys({
  mainValveId: joi.string().required(),
  status: joi.boolean().required()
});
