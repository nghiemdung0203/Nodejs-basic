const { userService } = require("../../service/User/userService");

const createUser = async (req, res) => {
  const { name, age, email, password,  } = req.body;
  try {
    const savedUser = await userService.createUserService(name, age, email, password);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createUser;
