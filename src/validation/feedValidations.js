const Joi = require('joi');

exports.feedSchema = Joi.object({
  text: Joi.string(),
  gallery: Joi.array().items(
    Joi.object({
      originalname: Joi.string()
        .regex(/\.(jpg|jpeg|png|mp4|avi|mkv|3gp|mov|flv|wmv|webm|mpeg)$/)
        .required(),
      path: Joi.string().required(),
    }),
  ),
}).options({ presence: 'optional' });
