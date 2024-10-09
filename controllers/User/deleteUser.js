const { userService } = require("../../service/User/userService");


const deleteUser = async(req, res) => {
  const { userId } = req.params;
  try {
    const result = await userService.deleteUserService(userId);
    res.json(result);
  } catch (error) {
    if (error.message === "User not found") {
      res.status(404).send("User not found");
    } else {
      res.status(500).send(error.message);
    }
  }
};

module.exports = deleteUser;
