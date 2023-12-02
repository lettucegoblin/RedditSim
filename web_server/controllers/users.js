const express = require("express");
const router = express.Router();

router
  .use("/user/:userId/about", (req, res) => {
    const { userId } = req.params;
    res.json({ message: `about user ${userId}` });
  })
  .use("/user/:userId/comments", (req, res) => {
    const { userId } = req.params;
    res.json({ message: `comments of user ${userId}` });
  })
  .use("/user/:userId/posts", (req, res) => {
    const { userId } = req.params;

    res.json({ message: `posts of user ${userId}` });
  })
  .use("/user/:userId", (req, res) => {
    const { userId } = req.params;
    res.json({ message: `whole user ${userId}` });
  });

module.exports = router;
