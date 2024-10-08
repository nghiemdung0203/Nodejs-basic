const Todo = require("../../Model/Todo");

const getTodo = async (req, res) => {
  const user_id = req.params.userId;
  try {
    const todoList = await Todo.find({ user: user_id });
    res.status(200).json(todoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getTodo;