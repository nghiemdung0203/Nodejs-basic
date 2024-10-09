const todoController = require('../controllers/Todo/Todo');
const authenticate = require('../middleware/authenticate');
const router = require("express").Router();

router.post('/createTodo', authenticate,todoController.Todo.createTodo)
router.get('/getTodoList', authenticate,todoController.Todo.getTodo)
router.put('/updateTodo', authenticate,todoController.Todo.updateTodo)
router.delete('/deleteTodo', authenticate,todoController.Todo.deleteTodo)

module.exports = router;