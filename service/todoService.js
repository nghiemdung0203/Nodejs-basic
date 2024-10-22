const {
  todoValidationSchema,
  paginationValidationSchema,
  userIdValidationSchema,
  updateValidationSchema,
  todoIdValidationSchema,
} = require("../middleware/validation/todoValidation");
const Todo = require("../Model/Todo");

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

const getTodoService = async (req) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { error: paginationError } = paginationValidationSchema.validate(
    req.query
  );
  if (paginationError) {
    throw new Error(paginationError.details[0].message);
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
    console.error(error);
    throw new Error(error.message);
  }
};

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

const deleteTodoService = async (req) => {
  const userId = req.user._id;
  const { todoId } = req.body;

  const { error: errorId } = todoIdValidationSchema.validate({
    todoId: todoId.toString(),
  });
  if (errorId) {
    throw new Error(errorId.details[0].message);
  }

  const { error } = userIdValidationSchema.validate({
    user: userId.toString(),
  });
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

module.exports = {
  createTodoService,
  getTodoService,
  updateTodoService,
  deleteTodoService,
};
