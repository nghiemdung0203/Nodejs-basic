const {
  userValidationSchema,
} = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const createUserService = async (req) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    const user = new User(req.body);
    await user.save();

    const token = await user.generateAuthToken();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createUserService;
