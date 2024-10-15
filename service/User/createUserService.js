const { userValidationSchema } = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const createUserService = async (req) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return { error: error.details[0].message };
  }

  try {
    const user = new User(req.body);
    await user.save();
    
    const token = await user.generateAuthToken();

    return { user, token };
  } catch (error) {
    console.error("Error in createUserService:", error);
    throw new Error(error.message);
  }
};

module.exports = createUserService;
