const { todoService } = require("../../service/Todo/todoService");
const redisClient = require('../../redis');

const getTodo = async (req, res) => {
  try {
    const { todos, totalTodos, page, limit } = await todoService.getTodoService(req);

    const responseData = {
      todos,
      totalTodos,
      currentPage: page,
      totalPages: Math.ceil(totalTodos / limit),
    };

    // Cache the data in Redis with a unique key for the user
    await redisClient.setEx('todos', 3600, JSON.stringify(responseData)); // Set with an expiration of 1 hour

    res.status(200).json({
      isCached: false,
      data: responseData, // Send the data in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getTodo;
