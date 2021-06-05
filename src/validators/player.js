const Joi = require('@hapi/joi');
const { defaultOptions } = './default';
const { getValidatorError } = require('../helpers/validator');

const rules = {
  name: Joi.string()
    .min(4)
    .max(21)
    .regex(/^(?!$)[a-zA-Z ]*$/)
    .required(),
  town_id: Joi.number().required(),
  vocation: Joi.number().required(),
  sex: Joi.number().required(),
};

const createCharacterValidator = (params) => {
  const { name, town_id, vocation, sex } = params;
  const schema = Joi.object({
    name: rules.name,
    town_id: rules.town_id,
    vocation: rules.vocation,
    sex: rules.sex,
  });

  return schema.validate({ name, town_id, vocation, sex }, defaultOptions);
};

const validateCreateCharacter = (req, res, next) => {
  const { error } = createCharacterValidator(req.body);

  if (error) {
    const messages = getValidatorError(error, 'player.createcharacter');
    return res.jsonBadRequest(null, null, { error: messages });
  }

  next();
};

module.exports = { validateCreateCharacter, createCharacterValidator };
