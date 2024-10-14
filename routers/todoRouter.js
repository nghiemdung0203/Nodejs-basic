const todoController = require('../controllers/Todo/Todo');
const authenticate = require('../middleware/authenticate');
const authenticateGetTodo = require('../middleware/authenticateGetTodo');
const router = require("express").Router();

router.post('/createTodo', authenticate,todoController.Todo.createTodo)
router.get('/getTodoList', authenticateGetTodo,todoController.Todo.getTodo)
router.put('/updateTodo', authenticate,todoController.Todo.updateTodo)
router.delete('/deleteTodo', authenticate,todoController.Todo.deleteTodo)

module.exports = router;