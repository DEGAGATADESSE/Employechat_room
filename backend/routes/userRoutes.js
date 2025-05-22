const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,getAllUsers,changePassword,deleteUser,updateUser
} = require("../controllers/userControllers");
const { protect,admin ,validateObjectId  } = require("../middlewares/authMiddleware");
const router = express.Router();
const User = require('../models/userModel');

router.route("/").get(protect,allUsers );
router.route("/").post(registerUser);
router.post("/login", authUser);
router.put('/:id', protect, updateUser);
router.put('/change-password', protect, changePassword);
router.route("/:userId").put(protect, admin, updateUser);

router.route("/users").get(protect, admin, getAllUsers);

// PUT update user by ID (protected route for admin only)
router.route('/:id').put(protect, updateUser).delete(protect, deleteUser);


// DELETE delete user by ID (protected route for admin only)
router.post('/:id/change-password', validateObjectId, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in change password endpoint:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});
module.exports = router;
