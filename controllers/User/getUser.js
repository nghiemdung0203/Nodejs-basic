const { getUserService } = require("../../service/userService");


const getUser = async (req, res) => {
 
  try {
    const users = await getUserService(req);
    res.status(201).json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = getUser;
