const { userService } = require("../../service/User/userService");


const createUser = async (req, res) => {
  try {
    
    const savedUser = await userService.createUserService(req);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createUser;
