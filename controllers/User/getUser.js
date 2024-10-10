
const { userService } = require("../../service/User/userService");

const getUser = async (req, res) => {
 
  try {
    const users = await userService.getUserService(req);
    res.status(201).json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = getUser;
