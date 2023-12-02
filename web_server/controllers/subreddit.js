const express = require("express");
const model = require("../models/subreddits");
const path = require("path");
const router = express.Router();

// between 3 and 21 characters, alphanumeric, first character must be alphabetic
function valid_subreddit_name(name) {
  return /^[a-zA-Z][a-zA-Z0-9-_]{2,20}$/.test(name);
}

router
  .post("/create", (req, res, next) => {
    const { display_name } = req.body;
    if (!valid_subreddit_name(display_name)) {
      res.status(400).json({ message: "invalid subreddit name" });
      return;
    }
    path_name = `/r/${display_name}`;
    // random number of subscribers from 10k to 10mil
    subscribers = Math.floor(Math.random() * 10000000) + 10000;
    model
      .createSubreddit(display_name, path_name, subscribers)
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .get("/all", (req, res, next) => {
    model
      .getAll()
      .then((result) => {
        const data = { data: result.items, total: result.total, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .get("/deleteAll", (req, res, next) => {
    model
      .deleteAll()
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .use("/about", (req, res, next) => {
    const { subreddit } = req.params;
    res.json({ message: `about subreddit ${subreddit}` });
  })
  .use("/comments/:commentId", (req, res, next) => {
    const { subreddit, commentId } = req.params;
    res.json({ message: `comment ${commentId} of subreddit ${subreddit}` });
  })
  .use("/:subreddit/submissions/create", (req, res, next) => {
    const { subreddit } = req.params;
    model.addSubmission(subreddit, req.body).then((result) => {
      const data = { data: result, isSuccessful: true };
      res.json(data);
    }).catch(next);
  })
  .use("/:subreddit/submissions", (req, res, next) => {
    const { subreddit } = req.params;
    model
      .getAllSubmissions(subreddit)
      .then((result) => {
        const data = { data: result.subreddit, total: result.total, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .use("/:subreddit/:postId", (req, res, next) => {
    const { subreddit, postId } = req.params;
    res.json({ message: `post ${postId} of subreddit ${subreddit}` });
  })
  .use("/:subreddit", (req, res, next) => {
    const { subreddit } = req.params;
    model
      .getByDisplayName(subreddit)
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);

    //res.json({ message: `subreddit ${subreddit}` });
  });

module.exports = router;
