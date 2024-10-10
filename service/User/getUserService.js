const {
  userIdValidationSchema,
} = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const getUserService = async (req) => {
  const userId = req.user._id.toString();
  const { error } = userIdValidationSchema.validate({ userId });
  if (error) {
    return { error: error.details[0].message };
  }
  try {
    const users = await User.findById({ _id: req.user._id });
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getUserService;
