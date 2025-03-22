// const express = require("express");
// const router = express.Router();
// const {
//   getAllUsers,
//   createNewUser,
//   updateUser,
//   deleteUser,
// } = require("../controllers/usersController");

// const verifyJWT = require("../middleware/verifyJWT");
// router.use(verifyJWT);

// router
//   .route("/")
//   .get(getAllUsers)
//   .post(createNewUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  createNewUser,
  updateUser,
  updateBalance,
  deleteUser,
} = require("../controllers/usersController");

const verifyJWT = require("../middleware/verifyJWT");

// Apply JWT verification to all routes
router.use(verifyJWT);

router
  .route("/")
  .get(getAllUsers)
  .post(createNewUser)
  .patch(updateUser)
  .delete(deleteUser); // Only admins can delete users
router.patch("/balance", updateBalance);
module.exports = router;
