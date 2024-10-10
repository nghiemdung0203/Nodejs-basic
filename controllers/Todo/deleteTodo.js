const { todoService } = require("../../service/Todo/todoService");

const deleteTodo = async (req, res) => {
  try {
    const deletedTodo = await todoService.deleteTodoService(req);
    res.status(200).json({ message: "Todo deleted successfully", deletedTodo });
  } catch (error) {
    if (error.message === "Todo not found") {
      res.status(404).json({ message: "Todo not found" });
    } else {
      res.status(400).json({ message: error.message }); // 400 for validation errors
    }
  }
};

module.exports = deleteTodo;
