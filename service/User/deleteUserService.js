const { userIdValidationSchema } = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const deleteUserService = async (req) => {
  const { userId } = req.params;
  const { error } = userIdValidationSchema.validate(userId);
  if (error) {
    return { error: error.details[0].message };
  }
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