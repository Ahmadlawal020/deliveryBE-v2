const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
const handleNewUser = async (req, res) => {
  const { email, password, role = "customer" } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({
      message: "Email and password (min 6 characters) are required.",
    });
  }

  const duplicate = await User.findOne({ email }).exec();
  if (duplicate) {
    return res.status(409).json({ message: "User has already registered." });
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    const result = await User.create({
      email,
      password: hashedPwd,
      roles: [role],
    });

    // console.log(result);
    res.status(201).json({ success: `New user ${email} created!` });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: err.message });
  }
};

// Login a user
const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res
      .status(404)
      .json({ message: "Email has not been registered yet." });
  }

  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = foundUser.roles;
    const firstName = foundUser.firstName;
    const lastName = foundUser.lastName;
    const id = foundUser._id; // Changed from userId to id

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id, // Changed from userId to id
          email: foundUser.email,
          roles,
          firstName,
          lastName,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ id, roles, accessToken }); // Changed from userId to id
  } else {
    res.status(401).json({ message: "Wrong password." });
  }
};

// Logout a user
const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

// Refresh token
const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
    const roles = foundUser.roles;
    const firstName = foundUser.firstName;
    const lastName = foundUser.lastName;
    const id = foundUser._id; // Changed from userId to id

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id, // Changed from userId to id
          email: foundUser.email,
          roles,
          firstName,
          lastName,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ id, roles, accessToken }); // Changed from userId to id
  });
};

module.exports = {
  handleNewUser,
  handleLogin,
  handleLogout,
  handleRefreshToken,
};
