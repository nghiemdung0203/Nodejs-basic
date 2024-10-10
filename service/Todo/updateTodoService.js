const {
  userIdValidationSchema,
  updateValidationSchema,
} = require("../../middleware/validation/todoValidation");
const Todo = require("../../Model/Todo");

const updateTodoService = async (req) => {
  const userId = req.user._id;
  const { todoId, description, completed, dueDate } = req.body;
  const updateData = { description, completed, dueDate };
  const { error: updateError } = updateValidationSchema.validate(updateData);
  if (updateError) {
    throw new Error(updateError.details[0].message);
  }
  
  const { error: userIdError } = userIdValidationSchema.validate({
    user: userId.toString(),
  });
  if (userIdError) {
    throw new Error(userIdError.details[0].message);
  }

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, user: userId },
      { description, completed, dueDate },
      { new: true, runValidators: true }
    );
    if (!updatedTodo) {
      throw new Error("Todo not found");
    }
    return updatedTodo;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = updateTodoService;
