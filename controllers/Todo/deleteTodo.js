const Todo = require("../../Model/Todo");

const deleteTodo = async (req, res) => {
  const { todoId } = req.body;
  try {
    const deletedTodo = await Todo.findByIdAndDelete({ _id: todoId });

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo deleted successfully", deletedTodo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteTodo;