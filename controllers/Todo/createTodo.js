const { todoService } = require("../../service/Todo/todoService");

const createTodo = async (req, res) => {
  try {
    const newTodo = await todoService.createTodoService(req);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

module.exports = createTodo;
