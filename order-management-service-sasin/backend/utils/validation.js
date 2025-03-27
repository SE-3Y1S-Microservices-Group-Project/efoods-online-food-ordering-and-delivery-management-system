//validation library for js
const Joi = require('joi');

//valdation schema for user registration
const registerValidation = (data) => {
    //define schema using joi validator
    const schema = Joi.object({
        username: Joi.string()
        .alphanum()
        .min(3)
        .max(10)
        .required()
        .messages({
            'string.alphanum': 'Username must contain only alphanumeric characters',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be less than 50 characters long',
            'any.required': 'Username is required'
        }),
        email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'any.required': 'Email is required'
        }),
        password: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'))
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character'
        }),
        confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords must match'
        })
    });

    return schema.validate(data);
};


//validation schema for user login
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'any.required': 'Email is required'
      }),
        password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
      })
    });

    return schema.validate(data);
};

module.exports = {
    registerValidation,
    loginValidation
};