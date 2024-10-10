const {
  todoIdValidationSchema,
  userIdValidationSchema,
} = require("../../middleware/validation/todoValidation");
const Todo = require("../../Model/Todo");

const deleteTodoService = async (req) => {
  const userId = req.user._id;
  const { todoId } = req.body;
  console.log(todoId);
  console.log(userId);

  const { error: errorId } = todoIdValidationSchema.validate({ todoId: todoId.toString() });
  if (errorId) {
    throw new Error(errorId.details[0].message);
  }

  const { error } = userIdValidationSchema.validate({ user: userId.toString() });
  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: todoId,
      user: userId,
    });

    if (!deletedTodo) {
      throw new Error("Todo not found");
    }
    return deletedTodo;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = deleteTodoService;
