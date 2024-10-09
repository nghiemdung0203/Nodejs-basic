const Todo = require("../../Model/Todo");

const deleteTodoService = async (userId, todoId) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, user: userId });

    if (!deletedTodo) {
      throw new Error("Todo not found");
    }
    return deletedTodo;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = deleteTodoService;
