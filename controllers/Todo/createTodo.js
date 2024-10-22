const { createTodoService } = require("../../service/todoService");


const createTodo = async (req, res) => {
  try {
    const newTodo = await createTodoService(req);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

module.exports = createTodo;
