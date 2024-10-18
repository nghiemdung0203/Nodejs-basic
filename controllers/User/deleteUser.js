const { userService } = require("../../service/User/userService");

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUserService(req);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).json("User not found");
    } else {
      res.status(500).json(error.message);
    }
  }
};

module.exports = deleteUser;
