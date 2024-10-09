const { todoService } = require("../../service/Todo/todoService");

const getTodo = async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { todos, totalTodos } = await todoService.getTodoService(
      userId,
      page,
      limit
    );

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
