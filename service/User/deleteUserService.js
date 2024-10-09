const User = require("../../Model/User");

const deleteUserService = async (userId) => {
  try {
    const deletedUser = await User.deleteOne({ _id: userId });
  if (deletedUser.deletedCount === 0) {
    throw new Error("User not found");
  }

  return { message: "User deleted" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = deleteUserService