const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

//@description     Get or Search all admins
//@route           GET /api/admins?search=
//@access          Public
const allAdmins = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const admins = await Admin.find(keyword).find({ _id: { $ne: req.admin._id } });
  res.send(admins);
});

//@description     Register new admin
//@route           POST /api/admin/register
//@access          Public
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    pic,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      pic: admin.pic,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error("Admin registration failed");
  }
});

//@description     Authenticate admin
//@route           POST /api/admin/login
//@access          Public
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      pic: admin.pic,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Get all users
//@route           GET /api/users
//@access          Private (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//@description     Update user by ID
//@route           PUT /api/user/:id
//@access          Private (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.roomName = req.body.roomName || user.roomName;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@description     Delete user by ID
//@route           DELETE /api/user/:id
//@access          Private (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid user ID');
  }
  const deletedUser = await User.findByIdAndDelete(id);
  res.status(200).json(deletedUser);
});

module.exports = {
  allAdmins,
  registerAdmin,
  authAdmin,
  getAllUsers,
  updateUser,
  deleteUser
};
