const User = require("../../Model/User");

const getUserListService = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const userList = await User.find().limit(limit).skip(skip).exec();

    const totalUser = await User.countDocuments();
    return {
      userList,
      totalUser,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getUserListService;
