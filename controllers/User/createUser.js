const User = require("../../Model/User");

const createUser = async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      age: req.body.age,
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = createUser;