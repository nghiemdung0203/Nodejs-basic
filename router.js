const userController = require('./controllers/User/User')
const todoController = require('./controllers/Todo/Todo')
const router = require("express").Router();



router.get("/user", userController.user.getUser);
router.post('/createUser', userController.user.createUser)
router.put('/updateUser/:userID', userController.user.updateUser)
router.delete("/deleteUser/:userID", userController.user.deleteUser);

router.post('/createTodo/:userId', todoController.Todo.createTodo)
router.get('/getTodo/:userId', todoController.Todo.getTodo)
router.put('/updateTodo', todoController.Todo.updateTodo)
router.delete('/deleteTodo', todoController.Todo.deleteTodo)
module.exports = router;
