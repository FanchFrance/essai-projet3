const express = require("express");
const companies = require('./companies');
// const objects = require('./objects');
// const message = require('./messages');
// const admin = require('./admin');
const users = require("./users");

const router = express.Router();

router.use('/companies', companies);
// router.use('/objects', objects);
// router.use('/messages', message);
// router.use('/admin', admin);
router.use("/users", users);

module.exports = router;
