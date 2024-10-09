const createTodoService = require('./createTodoService')
const deleteTodoService = require('./deleteTodoService')
const getTodoService = require('./getTodoService')
const updateTodoService = require('./updateTodoService')
exports.todoService = {
    createTodoService,
    getTodoService,
    updateTodoService,
    deleteTodoService
}