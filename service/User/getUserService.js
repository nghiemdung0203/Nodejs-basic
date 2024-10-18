const mongoose = require("mongoose");
const {
  userIdValidationSchema,
} = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const getUserService = async (req) => {
  try {
    const userId = req.user._id;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    const { error } = userIdValidationSchema.validate({
      userId: userId.toString(),
    });
    if (error) {
      return { error: error.details[0].message };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
    }

    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    throw new Error("An error occurred while fetching the user");
  }
};

module.exports = getUserService;
