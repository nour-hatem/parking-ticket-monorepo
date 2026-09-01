import Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5433),
  DATABASE_USER: Joi.string().default('parking'),
  DATABASE_PASSWORD: Joi.string().default('parking123'),
  DATABASE_NAME: Joi.string().default('parking_db'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  ARCJET_ENV: Joi.string().default('development'),
  ARCJET_KEY: Joi.string().allow('').optional(),
  ARCJET_MODE: Joi.string().default('DRY_RUN'),
});
