const express = require('express');
const router = express();
const { register } = require('../controllers/users.js');

router.route('/register').post(register);



module.exports = router;