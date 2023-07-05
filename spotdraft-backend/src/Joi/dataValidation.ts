import * as Joi from 'joi';

export const schemaRegister = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(8).max(30).required(),
  name: Joi.string().min(3).max(30).required(),
});

export const schemaLogin = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(8).max(30).required(),
});

export const schemaCreateFile = Joi.object({
  url: Joi.string().uri().required(),
  name: Joi.string().required(),
  size: Joi.number().required(),
  lastModified: Joi.number().required(),
});

export const schemaEmail = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});

export const schemaShareWithUsers = Joi.object({
  shareWithEveryOne: Joi.boolean().required(),
  shareWithAllAuthenticated: Joi.boolean().required(),
});
