const Joi = require('joi');

exports.createReplySchema = Joi.object({
  text: Joi.string().required(),
  commentId: Joi.string().required(),
}).options({ presence: 'required' });

exports.updateReplySchema = Joi.object({
  text: Joi.string().required(),
}).options({ presence: 'required' });
