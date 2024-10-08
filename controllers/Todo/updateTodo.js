const Todo = require("../../Model/Todo");

const updateTodo = async (req, res) => {
  const { todoId, description, completed, dueDate } = req.body;
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      { _id: todoId },
      { description, completed, dueDate },
      { new: true, runValidators: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateTodo;
