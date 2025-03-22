const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    roles, // Use `roles` instead of `role`
    address,
    vehicle,
    status,
  } = req.body;

  // Confirm data
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res
      .status(409)
      .json({ message: "This email is already registered." });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = {
    firstName,
    lastName,
    email,
    phoneNumber,
    password: hashedPassword,
    roles: roles || ["customer"], // Ensure roles is an array
    address,
    vehicle,
    status: status || "Available",
  };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    res
      .status(201)
      .json({ message: `New user ${user.firstName} ${user.lastName} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const {
    id,
    firstName,
    lastName,
    email,
    phoneNumber,
    roles, // Use `roles` instead of `role`
    password,
    address,
    vehicle,
    status,
  } = req.body;

  // Confirm data
  if (!id || !email) {
    return res.status(400).json({ message: "ID and email are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "This email is already registered." });
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  user.roles = roles || user.roles; // Ensure roles is an array
  user.address = address || user.address;
  user.vehicle = vehicle || user.vehicle;
  user.status = status || user.status;

  if (password) {
    // Hash new password
    user.password = await bcrypt.hash(password, 10);
  }

  user.updatedAt = Date.now();

  const updatedUser = await user.save();

  res.json({
    message: `${updatedUser.firstName} ${updatedUser.lastName} updated`,
  });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // Find the user first
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Store user details before deletion
  const userDetails = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    id: user._id,
  };

  // Delete the user
  await user.deleteOne();

  // Respond with the deleted user's details
  res.json({
    message: `User ${userDetails.firstName} ${userDetails.lastName} with ID ${userDetails.id} deleted`,
  });
});

// @desc Update user balance
// @route PATCH /users/balance
// @access Private
const updateBalance = asyncHandler(async (req, res) => {
  const { userId, amount, type } = req.body; // type can be 'deposit' or 'transaction'

  if (!userId || !amount || !type) {
    return res
      .status(400)
      .json({ message: "User ID, amount, and type are required" });
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (type === "deposit") {
    user.balance += amount;
  } else if (type === "transaction") {
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    user.balance -= amount;
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }

  user.updatedAt = Date.now();

  const updatedUser = await user.save();

  res.json({
    message: `User ${updatedUser.firstName} ${updatedUser.lastName} balance updated to ${updatedUser.balance}`,
  });
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  updateBalance,
};
