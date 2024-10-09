const { todoService } = require("../../service/Todo/todoService");

const deleteTodo = async (req, res) => {
  const userId = req.user._id;
  const { todoId } = req.body;
  try {
    const deletedTodo = await todoService.deleteTodoService(userId, todoId);
    res.status(200).json({ message: "Todo deleted successfully", deletedTodo });
  } catch (error) {
    if (error.message === "Todo not found") {
      res.status(404).json({ message: "Todo not found" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = deleteTodo;
