const { userService } = require("../../service/User/userService");

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserService(req);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser controller:", error.message);  // Log error message
    if (error.message.includes("User not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};


module.exports = updateUser;
