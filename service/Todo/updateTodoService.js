const Todo = require("../../Model/Todo");

const updateTodoService = async (
  userId,
  todoId,
  description,
  completed,
  dueDate
) => {
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
