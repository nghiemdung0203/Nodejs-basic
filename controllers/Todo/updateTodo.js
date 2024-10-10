const { todoService } = require("../../service/Todo/todoService");

const updateTodo = async (req, res) => {
  try {
    const updatedTodo = await todoService.updateTodoService(req);
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
