const userController = require("../controllers/User/User");
const authenticate = require("../middleware/authenticate");
const router = require("express").Router();

router.get("/user", authenticate, userController.user.getUser);
router.get("/getUserList", userController.user.getUserList)
router.post("/createUser", userController.user.createUser);
router.put("/updateUser", authenticate, userController.user.updateUser);
router.delete("/deleteUser/:userId", userController.user.deleteUser);

module.exports = router;
