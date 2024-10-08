const createTodo = require("./createTodo");
const deleteTodo = require("./deleteTodo");
const getTodo = require("./getTodo");
const updateTodo = require("./updateTodo");

exports.Todo = {
    createTodo,
    getTodo,
    updateTodo,
    deleteTodo
}