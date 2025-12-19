const Joi = require('joi');
const mongoose = require('mongoose');

const VALID_GENRES = ['Azione', 'Commedia', 'Drammatico', 'Thriller', 'Sci-Fi', 'Horror', 'Romantico', 'Animazione', 'Documentario', 'Fantasy'];

const contentSchema = Joi.object({
  title: Joi.string().trim().min(1). max(200).required(). messages({
    'string.empty': 'Il titolo è obbligatorio',
    'string.max': 'Max 200 caratteri'
  }),
  year: Joi.number().integer(). min(1900).max(new Date().getFullYear() + 2).required().messages({
    'number.base': 'Anno deve essere un numero',
    'number.min': 'Anno >= 1900'
  }),
  duration: Joi.number().integer(). min(1).required().messages({
    'number. base': 'Durata deve essere un numero',
    'number.min': 'Durata >= 1 minuto'
  }),
  genre: Joi.string().valid(...VALID_GENRES).required().messages({
    'any.only': `Genere deve essere uno tra: ${VALID_GENRES. join(', ')}`
  }),
  actors: Joi.array().items(Joi.string().trim(). min(1)).min(1).required().messages({
    'array.min': 'Almeno un attore richiesto'
  }),
  description: Joi.string().trim(). min(10).max(2000).required().messages({
    'string.min': 'Descrizione min 10 caratteri',
    'string.max': 'Descrizione max 2000 caratteri'
  })
});

const idSchema = Joi.string().custom((value, helpers) => {
  if (! mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
  return value;
}, 'ObjectId validation'). messages({ 'any.invalid': 'ID non valido' });

function validateContent(data) {
  return contentSchema.validate(data, { abortEarly: false });
}

function validateId(id) {
  return idSchema. validate(id);
}

module.exports = { validateContent, validateId, VALID_GENRES };