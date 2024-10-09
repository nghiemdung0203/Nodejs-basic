const createUserService = require("./createUserService");
const deleteUserService = require("./deleteUserService");
const getUserListService = require("./getUserListService");
const getUserService = require("./getUserService");
const updateUserService = require("./updateUserService");

exports.userService = {
    createUserService,
    getUserService,
    updateUserService,
    deleteUserService,
    getUserListService
}