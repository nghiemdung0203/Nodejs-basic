const Joi = require("joi");
const mongoose = require("mongoose");

// Define the validation schema for Todo
const todoValidationSchema = Joi.object({
  user: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid user ID format.");
      }
      return value;
    }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
  }),

  completed: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Completed must be a boolean value.",
  }),

  dueDate: Joi.date().optional().messages({
    "date.base": "Due date must be a valid date.",
  }),
});

const todoIdValidationSchema = Joi.object({
  todoId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid todo ID format.");
      }
      return value;
    }),
});

const paginationValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be at least 1.",
  }),

  limit: Joi.number().integer().min(1).optional().default(10).messages({
    "number.base": "Limit must be a number.",
    "number.integer": "Limit must be an integer.",
    "number.min": "Limit must be at least 1.",
  }),
});

const userIdValidationSchema = Joi.object({
    user: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid user ID format.");
        }
        return value;
      })
  });


  const updateValidationSchema = Joi.object({
    description: Joi.string().trim().messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description is required if provided.",
    }),
    
    completed: Joi.boolean().messages({
      "boolean.base": "Completed must be a boolean value.",
    }),
  
    dueDate: Joi.date().messages({
      "date.base": "Due date must be a valid date.",
    })
  }).or('description', 'completed', 'dueDate');

module.exports = {
  todoValidationSchema,
  todoIdValidationSchema,
  paginationValidationSchema,
  userIdValidationSchema,
  updateValidationSchema
};
