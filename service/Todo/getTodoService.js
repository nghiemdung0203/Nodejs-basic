const Todo = require("../../Model/Todo");

const getTodoService = async (userId, page, limit) => {
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
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getTodoService;
