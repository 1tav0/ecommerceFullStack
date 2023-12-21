const express = require('express');
const router = express();
const { register, login, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword } = require('../controllers/users.js');
const {authMiddleware, isAdmin}  = require('../middleware/authMiddleware.js');


router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/all-users').get(getAllUsers);
router.route('/refresh').get(handleRefreshToken);
router.route('/update-password').patch(authMiddleware, updatePassword);
router.route('/forgot-password-token').post(forgotPasswordToken);
router.route('/reset-password/:token').patch(resetPassword);

router.route('/:id').get(authMiddleware, isAdmin, getUser).delete(deleteUser)
router.route('/edit-user').patch(authMiddleware, updateUser);
router.route('/block-user/:id').patch(authMiddleware, isAdmin, blockUser);
router.route('/unblock-user/:id').patch(authMiddleware, isAdmin, unblockUser);

module.exports = router;