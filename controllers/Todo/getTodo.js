const { todoService } = require("../../service/Todo/todoService");

const getTodo = async (req, res) => {
  try {
    const { todos, totalTodos, page, limit } = await todoService.getTodoService(req);

    res.status(200).json({
      totalTodos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / limit),
      todos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getTodo;
