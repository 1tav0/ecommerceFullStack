const express = require('express');
const router = express();
const { register, login, getAllUsers, getUser, deleteUser, updateUser } = require('../controllers/users.js');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/all-users').get(getAllUsers);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;