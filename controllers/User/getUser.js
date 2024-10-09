
const { userService } = require("../../service/User/userService");

const getUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const users = await userService.getUserService(userId);
    res.status(201).json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = getUser;
