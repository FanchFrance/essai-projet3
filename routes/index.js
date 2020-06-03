const express = require("express");
const companies = require('./companies');
const objects = require('./objects');
const message = require('./messages');
const admin = require('./admin');
const users = require("./users");
const games = require('./games');
const sessions = require('./sessions');

const router = express.Router();

router.use('/companies', companies);
router.use('/objects', objects);
router.use('/messages', message);
router.use('/admin', admin);
router.use("/users", users);
router.use('/games', games);
router.use('/sessions', sessions);

module.exports = router;
