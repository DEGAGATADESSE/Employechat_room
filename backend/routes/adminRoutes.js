const express = require("express");
const {
  registerAdmin,
  authAdmin,
  allAdmins,
  getAllUsers,
} = require("../controllers/adminControllers");
const { protect, admin } = require("../middlewares/authMiddleware");
const { updateUser, deleteUser } = require("../controllers/userControllers");
const User = require('../models/userModel');
const router = express.Router();

// GET all admins (protected route for admin only)
router.route("/admins").get(protect, admin, allAdmins);

// POST new admin registration
router.route("/register").post(registerAdmin);

// POST admin login
router.route("/login").post(authAdmin);

// GET all users (protected route for admin only)
router.route("/users").get(protect, admin, getAllUsers);

// PUT update user by ID (protected route for admin only)
router.route('/:id').put(protect, updateUser).delete(protect, deleteUser);

// DELETE delete user by ID (protected route for admin only)

// GET all users (non-protected route, available to all)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
