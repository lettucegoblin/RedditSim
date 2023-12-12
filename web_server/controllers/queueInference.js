const express = require("express");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const model = require("../models/subreddits");

const {
  inference_submission,
  inference_comments,
  reserve_spot,
} = require("../models/inference");

queue = [];
toDo = {};
lastCheckTimestamp = Date.now();
setInterval(() => {
  if (queue.length > 0 && Date.now() - lastCheckTimestamp > 5000) {
    lastCheckTimestamp = Date.now();
    console.log("queue", queue.length);
    let id = queue[0];
    if (toDo[id].spot_id) {
      if (toDo[id].status === "done") {
        queue.shift();
        if (queue.length == 0) return;
        id = queue[0];
      } else {
        // still pending, check again later
        return;
      }
    }
    reserve_spot().then((res) => {
      const { spot_id } = res;
      console.log("spot_id", spot_id);
      if (!spot_id) {
        return;
      }
      toDo[id].spot_id = spot_id;
      if (toDo[id].type === "commentPath") {
        inference_comments(
          spot_id,
          toDo[id].postObj,
          toDo[id].nextUser,
          toDo[id].numberOfComments,
          toDo[id].commentPath
        ).then((res) => {
          console.log("inference_comments", spot_id);
          if (res.commentPath) {
            // res.commentPath is in the format of [{formatted: String, text: String, user: String}, ...]
            // to Do[id].commentPath is in the format of [{_id: ObjectId, submissionId: ObjectId, commentPath: [{_id: ObjectId, formatted: String, text: String, user: String}, ...]}]
            //toDo[id].commentPath = res.commentPath;
            //toDo[id].status = "done";
            // insert in database
            model
              .addCommentPath(toDo[id].postObj["_id"], toDo[id].commentPath, res.commentPath)
              .then((newCommentPath) => {
                toDo[id].commentPath = newCommentPath;

                toDo[id].status = "done";
                console.log("addCommentPath", newCommentPath);
              })
              .catch((err) => {
                console.log("addCommentPath", err);
                toDo[id].status = "done";
              });
            
          }
        }).catch((err) => {
          console.log("inference_comments", err);
          toDo[id].error = err;
          toDo[id].status = "error";
        });
      } else {
        inference_submission(spot_id, toDo[id]).then((res) => {
          console.log("inference_submission", spot_id);
          if (res.postObj) {
            toDo[id].postObj = res.postObj;
            if (!toDo[id].subreddit) {
              let newSubreddit = toDo[id].postObj["subreddit"];
              // remove the /r/ from the subreddit name if it exists
              if (newSubreddit.startsWith("/r/")) {
                newSubreddit = newSubreddit.substring(3);
              }
              toDo[id].subreddit = newSubreddit;
            }
            toDo[id].postObj["timestamp"] = Date.now();
            model
              .addSubmission(toDo[id].subreddit, toDo[id].postObj)
              .then((result) => {
                const data = { data: result, isSuccessful: true };
                toDo[id].postObj["_id"] = data.data.insertedId;
                toDo[id].status = "done";
                console.log("addSubmission", toDo[id].postObj["_id"]);
              })
              .catch((err) => {
                console.log("addSubmission", err);
                toDo[id].error = err;
                toDo[id].status = "error";
              });
          }
        }).catch((err) => {
          console.log("inference_submission", err);
          toDo[id].error = err;
          toDo[id].status = "error";
        });
      }
    }).catch((err) => {
      console.log("reserve_spot", err);
      toDo[id].error = err;
      toDo[id].status = "error";
    });
  }
}, 5000);

router
  .get("/", (req, res, next) => {
    res.json({ queue, toDo });
  })
  .post("/addSubmission", (req, res, next) => {
    const { timestamp, subreddit, author, title, media } = req.body;
    console.log(subreddit, author, title, media);
    const queueId = uuidv4();
    queue.push(queueId);
    queueLength = queue.length;
    toDo[queueId] = {
      type: "submission",
      timestamp,
      subreddit,
      author,
      title,
      media,
      status: "pending",
    };
    res.json({
      message: "submitted",
      queueId,
      queueLength,
      queueIndex: queue.indexOf(queueId),
      postObj: toDo[queueId].postObj,
    });
  })
  .get("/getSubmission", (req, res, next) => {
    const { queueId } = req.query;
    const submission = toDo[queueId];
    if (!submission) {
      res.json({ message: "no submission" });
      return;
    }
    if (submission.status === "pending") {
      queueLength = queue.length;
      res.json({
        message: "pending",
        queueId,
        queueLength,
        queueIndex: queue.indexOf(queueId),
        postObj: submission.postObj,
      });
      return;
    } else if (submission.status === "done") {
      res.json({ message: "done", postObj: submission.postObj });
      return;
    }
    else if (submission.status === "error") {
      res.json({ message: "error", error: submission.error });
      return;
    }
    res.json({ message: "error" });
  })
  .post("/addCommentPath", (req, res, next) => {
    let { commentPath, postObj, numberOfComments, nextUser } = req.body;
    const queueId = uuidv4();
    queue.push(queueId);
    queueLength = queue.length;
    numberOfComments = numberOfComments ?? 1;
    toDo[queueId] = {
      type: "commentPath",
      commentPath,
      postObj,
      numberOfComments,
      nextUser,
      status: "pending",
    };
    res.json({
      message: "submitted",
      queueId,
      queueLength,
      queueIndex: queue.indexOf(queueId),
      postObj: toDo[queueId].postObj,
      numberOfComments,
    });
  })
  .get("/getCommentPath", (req, res, next) => {
    const { queueId } = req.query;
    const commentPath = toDo[queueId];
    if (!commentPath) {
      res.json({ message: "no commentPath" });
      return;
    }
    if (commentPath.status === "pending") {
      queueLength = queue.length;
      res.json({
        message: "pending",
        queueId,
        queueLength,
        queueIndex: queue.indexOf(queueId),
        postObj: commentPath.postObj,
        commentPath: commentPath.commentPath,
        numberOfComments: commentPath.numberOfComments,
      });
      return;
    } else if (commentPath.status === "done") {
      const path = JSON.stringify(commentPath.commentPath)
      console.log(path)
      res.json({
        message: "done",
        postObj: commentPath.postObj,
        commentPathId: commentPath.commentPath._id,
        commentPath: commentPath.commentPath.commentPath,
      });
      return;
    }
    res.json({ message: "error" });
  });

module.exports = router;
