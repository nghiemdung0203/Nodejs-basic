const {
  userValidationSchema,
  userIdValidationSchema,
  updateUserValidationSchema,
} = require("../middleware/validation/userValidation");
const User = require("../Model/User");
const mongoose = require("mongoose");

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

const getUserListService = async (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const skip = (page - 1) * limit;
    const userList = await User.find()
      .select("-password")
      .limit(limit)
      .skip(skip)
      .exec();

    const totalUser = await User.countDocuments();
    return {
      userList,
      totalUser,
      page,
      limit,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

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
    throw new Error(error.message); // Customize this message as needed
  }
};

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

module.exports = {
  createUserService,
  getUserListService,
  getUserService,
  updateUserService,
  deleteUserService,
};
