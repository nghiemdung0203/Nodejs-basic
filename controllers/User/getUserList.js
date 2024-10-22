const { getUserListService } = require("../../service/userService");


const getUserList = async (req, res) => {
 
  try {
    const { userList, totalUser, page, limit } = await getUserListService(req);
    res
      .status(200)
      .json({
        totalUser,
        currentPage: page,
        totalPages: Math.ceil(totalUser / limit),
        userList
      });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = getUserList;