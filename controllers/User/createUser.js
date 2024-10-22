const { createUserService } = require("../../service/userService");



const createUser = async (req, res) => {
  try {
    
    const savedUser = await createUserService(req);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createUser;
