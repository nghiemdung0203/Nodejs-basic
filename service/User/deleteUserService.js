
const {
  userIdValidationSchema,
} = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const deleteUserService = async (req) => {
  try {
    const { userId } = req.params;

    // Validate the userId
    const { error } = userIdValidationSchema.validate({ userId });
    if (error) {
      return { error: error.details[0].message };
    }

    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return { error: "User not found" };
    }

    return { message: "User deleted" };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = deleteUserService;
