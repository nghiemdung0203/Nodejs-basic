const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const redisClient = require("../redis");

const authenticateGetTodo = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const data = jwt.verify(token, process.env.JWT_SECRET);
  try {
    const user = await User.findOne({ _id: data._id, "tokens.token": token });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;

    const cacheKey = "todos";
    const cachedTodos = await redisClient.get(cacheKey);
    if (cachedTodos) {
      res.status(200).json({
        isCached: true,
        data: JSON.parse(cachedTodos),
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = authenticateGetTodo;
