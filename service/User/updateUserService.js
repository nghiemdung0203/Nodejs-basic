const User = require("../../Model/User");

const updateUserService = async (userId, name, age) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { name: name, age: age } },
        { new: true }
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
