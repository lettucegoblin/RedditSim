const express = require("express");
const router = express.Router();

const model = require("../models/users.js")
const { requireUser } = require("../middleware/authorization");
router
.post("/login", (req, res, next) => {
  const { username, passcode } = req.body;
  model
    .login(username, passcode)
    .then((user) => {
      res.json(user);
    })
    .catch(next);
})
.post("/register", (req, res, next) => {
  const { username, passcode } = req.body;
  model
    .register(username, passcode)
    .then((user) => {
      res.json(user);
    }).catch(next);
})

module.exports = router;
