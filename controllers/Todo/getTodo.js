const redisClient = require("../../redis");
const { getTodoService } = require("../../service/todoService");

const getTodo = async (req, res) => {
  try {
    const { todos, totalTodos, page, limit } = await getTodoService(req);

    const responseData = {
      todos,
      totalTodos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / limit),
    };

    await redisClient.setEx("todos", 3600, JSON.stringify(responseData));

    res.status(200).json({
      isCached: false,
      data: responseData, // Send the data in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getTodo;
