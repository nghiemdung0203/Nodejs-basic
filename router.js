const userController = require('./controllers/User')

const router = require("express").Router();



router.get("/user", userController.user.getUser);
router.post('/createUser', userController.user.createUser)
router.put('/updateUser/:userID', userController.user.updateUser)
router.delete("/deleteUser/:userID", userController.user.deleteUser);

module.exports = router;
