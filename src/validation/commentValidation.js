const Joi = require('joi');

exports.createCommentSchema = Joi.object({
  text: Joi.string().required(),
  feedId: Joi.string().required(),
}).options({ presence: 'required' });

exports.updateCommentSchema = Joi.object({
  text: Joi.string().required(),
}).options({ presence: 'required' });
