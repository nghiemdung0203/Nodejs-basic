const User = require("../../Model/User");

const getUserService = async (userId) => {
  try {
    const users = await User.findById({ _id: userId });
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getUserService;
