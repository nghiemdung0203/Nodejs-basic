const getUser = require('./getUser');
const createUser = require('./createUser');
const updateUser = require('./updateUser');
const deleteUser = require('./deleteUser');

exports.user = {
    getUser,
    createUser,
    updateUser,
    deleteUser,
}