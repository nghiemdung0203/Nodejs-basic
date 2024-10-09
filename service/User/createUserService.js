const User = require("../../Model/User");
const jwt = require("jsonwebtoken");

const createUserService = async (name, age, email, password) => {
  try {
    const user = new User({
      name: name,
      age: age,
      email: email,
      password: password,
    });
    await user.save();
    await user.generateAuthToken();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createUserService;
