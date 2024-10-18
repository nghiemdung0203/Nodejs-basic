const User = require("../../Model/User");

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

module.exports = getUserListService;
