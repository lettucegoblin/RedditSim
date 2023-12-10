const express = require("express");
const model = require("../models/subreddits");
const path = require("path");
const router = express.Router();
const { requireUser } = require('../middleware/authorization');

// between 3 and 21 characters, alphanumeric, first character must be alphabetic
function valid_subreddit_name(name) {
  return /^[a-zA-Z][a-zA-Z0-9-_]{2,20}$/.test(name);
}

function createSubredditObj(display_name) {
  if (!valid_subreddit_name(display_name)) {
    return { error: "invalid subreddit name" };
  }
  path_name = `/r/${display_name}`;
  // random number of subscribers from 10k to 10mil
  subscribers = Math.floor(Math.random() * 10000000) + 10000;
  return { display_name, path_name, subscribers };
}

router
  .post("/create", (req, res, next) => {
    const { display_name } = req.body;
    subredditObj = createSubredditObj(display_name);
    if (subredditObj.error) {
      res.json({ error: subredditObj.error });
      return;
    }
    model
      .createSubreddit(...subredditObj)
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .post("/all", (req, res, next) => {
    const { page, pageSize } = req.body;
    model
      .getAll(page, pageSize)
      .then((result) => {
        console.log("all", result);
        const data = {
          data: result.items,
          total: result.total,
          isSuccessful: true,
        };
        res.json(data);
      })
      .catch(next);
  })
  .post("/all/submissions", (req, res, next) => {
    const { page, pageSize } = req.body;
    model
      .getAllSubmissions(page, pageSize)
      .then((result) => {
        console.log("/all/submissions", result);
        const data = {
          data: result.items,
          total: result.total,
          isSuccessful: true,
        };
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
  .get("/deleteAllSubmissions", (req, res, next) => {
    model
      .deleteAllSubmissions()
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .get("/about", (req, res, next) => {
    const { subreddit } = req.params;
    res.json({ message: `about subreddit ${subreddit}` });
  })
  .get("/comments/:commentId", (req, res, next) => {
    const { subreddit, commentId } = req.params;
    res.json({ message: `comment ${commentId} of subreddit ${subreddit}` });
  })   //comments/list/656c0329eb07c3872bd6d9cf
  .get("/comments/list/:submissionid", (req, res, next) => {
    const {  submissionid } = req.params;
    model.getCommentPathsRoots(submissionid).then((commentPaths) => {
      const data = { data: commentPaths, isSuccessful: true };
      res.json(data);
    })
    .catch(next);
  })
  .get("/comments/:submissionid/:commentPathId", (req, res, next) => {
    const {  submissionid, commentPathId } = req.params;
    model.getCommentPath(submissionid, commentPathId).then((commentPaths) => {
      const data = { data: commentPaths, isSuccessful: true };
      res.json(data);
    })
    .catch(next);
  })
  .post("/comments/:submissionid/:commentPathId", requireUser(), (req, res, next) => {
    const {  submissionid, commentPathId } = req.params;
    const { text, userId, user } = req.body; // user is username
    model.addToEndOfCommentPath(submissionid, commentPathId, text, userId, user).then((result) => {
      const data = { data: result, isSuccessful: true };
      res.json(data);
    })
    .catch(next);
  })
  .post("/:subreddit/submissions/create", (req, res, next) => {
    const { subreddit } = req.params;
    model
      .addSubmission(subreddit, req.body)
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  // get submission by id
  .get("/:subreddit/submissions/:submissionId", (req, res, next) => {
    const { subreddit, submissionId } = req.params;
    model
      .getSubmissionById(submissionId)
      .then((result) => {
        const data = { data: result, isSuccessful: true };
        res.json(data);
      })
      .catch(next);
  })
  .post("/:subreddit/submissions", async (req, res, next) => {
    const { subreddit } = req.params;
    const { page, pageSize } = req.body;
    console.log("/:subreddit/submissions", subreddit);
    let subredditObj = await model.getByDisplayName(subreddit);
    if (!subredditObj) {
      // create subreddit
      subredditObj = createSubredditObj(subreddit);
      if (subredditObj.error) {
        res.json({ error: subredditObj.error });
        return;
      }
      await model.createSubreddit(
        subredditObj.display_name,
        subredditObj.path_name,
        subredditObj.subscribers
      );
    }

    model
      .getAllSubmissionsOfSubreddit(subreddit, page, pageSize)
      .then((result) => {
        const data = {
          data: result.subreddit,
          total: result.total,
          isSuccessful: true,
        };
        res.json(data);
      })
      .catch(next);
  })
  .get("/:subreddit/:postId", (req, res, next) => {
    const { subreddit, postId } = req.params;
    res.json({ message: `post ${postId} of subreddit ${subreddit}` });
  })
  .get("/:subreddit", async (req, res, next) => {
    const { subreddit } = req.params;
    console.log("getByDisplayName", subreddit);
    let subredditObj = await model.getByDisplayName(subreddit);
    if (!subredditObj) {
      // create subreddit
      subredditObj = createSubredditObj(subreddit);
      if (subredditObj.error) {
        res.json({ error: subredditObj.error });
        return;
      }
      await model.createSubreddit(
        subredditObj.display_name,
        subredditObj.path_name,
        subredditObj.subscribers
      );
    }
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
