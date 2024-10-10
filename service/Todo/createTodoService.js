const { now } = require("mongoose");
const { todoValidationSchema } = require("../../middleware/validation/todoValidation");
const Todo = require("../../Model/Todo");

const createTodoService = async (req) => {
  const userId = req.user._id;
  const { description, dueDate } = req.body;

  const { error } = todoValidationSchema.validate({
    ...req.body,
    user: userId.toString(),
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    const newTodo = new Todo({
      user: userId,
      description: description,
      completed: false,
      dueDate: dueDate || Date.now(),
    });
    await newTodo.save();
    return newTodo;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createTodoService;
