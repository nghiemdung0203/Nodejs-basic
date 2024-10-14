
const {
  userIdValidationSchema,
  paginationValidationSchema,
} = require("../../middleware/validation/todoValidation");
const Todo = require("../../Model/Todo");

const getTodoService = async (req) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { error: paginationError } = paginationValidationSchema.validate(
    req.query
  );
  if (paginationError) {
    throw new Error({paginationError: paginationError.details[0].message});
    
  }

  const { error: userIdError } = userIdValidationSchema.validate({
    user: userId.toString(),
  });
  if (userIdError) {
    throw new Error(userIdError.details[0].message);
  }

  try {
    const skip = (page - 1) * limit;

    const todoList = await Todo.find({ user: userId })
      .limit(limit)
      .skip(skip)
      .exec();

    const totalTodos = await Todo.countDocuments({ user: userId });

    return {
      todos: todoList,
      totalTodos,
      page,
      limit,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getTodoService;
