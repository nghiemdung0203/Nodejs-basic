const {
  userIdValidationSchema,
  updateUserValidationSchema,
} = require("../../middleware/validation/userValidation");
const User = require("../../Model/User");

const updateUserService = async (req) => {
  const userId = req.user._id.toString();
  if (!userId) {
    return { error: "User ID is required" };
  }

  // Validate user ID
  const { error: userIdError } = userIdValidationSchema.validate({ userId });
  if (userIdError) {
    console.log("User ID Validation Error:", userIdError.details[0].message);
    throw new Error(userIdError.details[0].message);
  }

  // Validate request body
  const { error: bodyError } = updateUserValidationSchema.validate(req.body);
  if (bodyError) {
    console.log("Body Validation Error:", bodyError.details[0].message);
    throw new Error(bodyError.details[0].message); // Log the validation error
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

    const userObject = updatedUser.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    console.error("Update Error:", error.message); // Log the error message
    // Throw a more specific error message to help with testing
    throw new Error("Database error during user update"); // Customize this message as needed
  }
};

module.exports = updateUserService;
