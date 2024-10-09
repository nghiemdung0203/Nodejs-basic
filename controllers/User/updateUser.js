const { userService } = require("../../service/User/userService");

const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { name, age } = req.body;
  try {
    const updatedUser = await userService.updateUserService(userId, name, age);
    res.json(updatedUser);
  } catch (err) {
    if (err.message === "User not found") {
      res.status(404).send("User not found");
    } else {
      res.status(500).send(err.message);
    }
  }
};

module.exports = updateUser;
