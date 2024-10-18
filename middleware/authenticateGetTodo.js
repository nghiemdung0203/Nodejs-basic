const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const redisClient = require("../redis");

const authenticateGetTodo = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .send({ error: "No token provided, authorization denied." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: data._id, "tokens.token": token });
    if (!user) {
      throw new Error("User not found.");
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
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .send({ error: "Not authorized to access this resource." });
    }
    return res
      .status(401)
      .send({ error: "Not authorized to access this resource." });
  }
};

module.exports = authenticateGetTodo;
