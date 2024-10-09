const { todoService } = require("../../service/Todo/todoService");

const updateTodo = async (req, res) => {
  const userId = req.user._id;
  const { todoId, description, completed, dueDate } = req.body;

  try {
    const updatedTodo = await todoService.updateTodoService(
      userId,
      todoId,
      description,
      completed,
      dueDate
    );
    res.status(200).json(updatedTodo);
  } catch (error) {
    if (error.message === "Todo not found") {
      res.status(404).json({ message: "Todo not found" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = updateTodo;
