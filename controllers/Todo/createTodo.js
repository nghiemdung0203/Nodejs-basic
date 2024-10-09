const { todoService } = require("../../service/Todo/todoService");

const createTodo = async (req, res) => {
  const userId = req.user._id;
  const { description, dueDate } = req.body;
  try {
    const newTodo = await todoService.createTodoService(
      userId,
      description,
      dueDate
    );
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = createTodo;
