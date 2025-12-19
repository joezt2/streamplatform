const Joi = require('joi');
const mongoose = require('mongoose');

const ratingSchema = Joi.object({
  userId: Joi.string().trim(). min(1).required(). messages({ 'string.empty': 'ID utente obbligatorio' }),
  contentId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }, 'ObjectId validation').required().messages({ 'any.invalid': 'ID contenuto non valido' }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Voto minimo 1',
    'number.max': 'Voto massimo 5',
    'number.integer': 'Voto deve essere intero'
  }),
  comment: Joi.string().trim(). max(1000).allow('').optional().messages({ 'string.max': 'Commento max 1000 caratteri' })
});

const ratingUpdateSchema = Joi.object({
  rating: Joi.number().integer(). min(1).max(5). optional(),
  comment: Joi.string().trim().max(1000). allow('').optional()
}). min(1).messages({ 'object.min': 'Almeno un campo richiesto per update' });

const idSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
  return value;
}, 'ObjectId validation').messages({ 'any.invalid': 'ID non valido' });

function validateRating(data, isUpdate = false) {
  const schema = isUpdate ? ratingUpdateSchema : ratingSchema;
  return schema.validate(data, { abortEarly: false });
}

function validateId(id) {
  return idSchema.validate(id);
}

module.exports = { validateRating, validateId };