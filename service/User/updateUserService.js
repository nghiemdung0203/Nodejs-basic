const { userIdValidationSchema, updateUserValidationSchema } = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const updateUserService = async (req) => {
  const userId = req.user._id.toString();

  const { error: userIdError } = userIdValidationSchema.validate({ userId });
  if (userIdError) {
    return {error: userIdError.details[0].message};
  }

  const { error: bodyError } = updateUserValidationSchema.validate(req.body);
  if (bodyError) {
    return {error: bodyError.details[0].message}; 
  }



  const userPayload = {
    name: req.body.name,
    age: req.body.age,
  };

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: userPayload },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = updateUserService;
