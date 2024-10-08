const User = require("../../Model/User");

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userID },
      { $set: { name: req.body.name } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = updateUser;
