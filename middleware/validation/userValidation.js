const Joi = require("joi");
const mongoose = require('mongoose')

// Define the validation schema
const userValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
  
  age: Joi.number().integer().required().messages({
    "number.base": "Age must be a number.",
    "any.required": "Age is required.",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().required().custom((value, helpers) => {
    const strongPasswordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordCriteria.test(value)) {
      return helpers.message(
        "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
    return value;
  }).messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});


// Validation schema for updating a user
const updateUserValidationSchema = Joi.object({
  name: Joi.string().trim().optional().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
  }),

  age: Joi.number().integer().optional().messages({
    "number.base": "Age must be a number.",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Invalid email address.",
  }),

  password: Joi.string().optional().custom((value, helpers) => {
    const strongPasswordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordCriteria.test(value)) {
      return helpers.message(
        "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
    return value;
  }).messages({
    "string.empty": "Password is required.",
  }),
}).min(1).messages({
  "object.min": "At least one field is required to update."
});

const userIdValidationSchema = Joi.object({
  userId: Joi.string().required().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message("Invalid user ID format.");
    }
    return value;
  }),
});


module.exports = { userValidationSchema, userIdValidationSchema, updateUserValidationSchema };
