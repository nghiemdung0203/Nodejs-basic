const { updateUserService } = require("../../service/userService");


const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserService(req);
    return res.status(201).json(updatedUser);
  } catch (error) {
    if (error.message.includes("User not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};


module.exports = updateUser;
