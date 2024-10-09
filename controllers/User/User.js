const getUser = require('./getUser');
const createUser = require('./createUser');
const updateUser = require('./updateUser');
const deleteUser = require('./deleteUser');
const getUserList = require('./getUserList');


exports.user = {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserList
}