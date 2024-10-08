const User = require("../Model/User");

const getUser = async (req, res) => {
  try {
    const users = await User.find(); // Thay thế callback bằng async/await
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = getUser;
