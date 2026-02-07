const express = require('express');
const router = express.Router();

const loginController = require('@/app/http/controllers/loginController.js')


/* GET home page. */
router.post('/login', loginController.login);

module.exports = router;