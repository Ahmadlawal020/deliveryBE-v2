const express = require("express");
const router = express.Router();
const {
  handleLogin,
  handleLogout,
  handleNewUser,
  handleRefreshToken,
} = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

// Auth routes
router.route("/signup").post(handleNewUser);
router.route("/login").post(loginLimiter, handleLogin);
router.route("/logout").post(handleLogout);
router.route("/refresh").get(handleRefreshToken);

module.exports = router;
