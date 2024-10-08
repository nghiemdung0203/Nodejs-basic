const User = require("../../Model/User");

const deleteUser = (req, res) => {
    User.deleteOne({ _id: req.params.userID })
      .then(() => res.json({ message: "user Deleted" }))
      .catch((err) => res.send(err));
  };

  module.exports = deleteUser;