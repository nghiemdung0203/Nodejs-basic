const { userService } = require("../../service/User/userService");

const getUserList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const { userList, totalUser } = await userService.getUserListService(
      page,
      limit
    );
    res
      .status(200)
      .json({
        totalUser,
        currentPage: page,
        totalPages: Math.ceil(totalUser / limit),
        userList
      });
  } catch (error) {
    res.status(500).send(err.message);
  }
};

module.exports = getUserList;