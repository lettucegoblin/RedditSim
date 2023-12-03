const express = require("express");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const model = require("../models/subreddits");

const { inference_submission, reserve_spot } = require("../models/inference");

queue = [];
toDo = {};
lastCheckTimestamp = Date.now();
setInterval(() => {
  if (queue.length > 0 && Date.now() - lastCheckTimestamp > 5000) {
    lastCheckTimestamp = Date.now();
    console.log("queue", queue, toDo);
    let id = queue[0];
    if (toDo[id].spot_id) {
      if (toDo[id].status === "done") {
        queue.shift();
        if (queue.length == 0) return;
        id = queue[0];
      } else {
        // still pending
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
      inference_submission(spot_id, toDo[id]).then((res) => {
        console.log(res);
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

              console.log("addSubmission", data);
              toDo[id].status = "done";
            })
            .catch((err) => {
              console.log("addSubmission", err);
              toDo[id].status = "done";
            });
        }
      });
    });
  }
}, 5000);

router
  .get("/", (req, res, next) => {
    res.json({ queue, toDo });
  })
  .post("/addSubmission", (req, res, next) => {
    const { subreddit, author, title, media } = req.body;
    console.log(subreddit, author, title, media);
    const id = uuidv4();
    queue.push(id);
    toDo[id] = { subreddit, author, title, media, status: "pending" };
    res.json({ id, index: queue.indexOf(id), postObj: toDo[id] });
  })
  .get("/getSubmission", (req, res, next) => {
    const { id } = req.query;
    const submission = toDo[id];
    if (!submission) {
      res.json({ message: "no submission" });
      return;
    }
    if (submission.status === "pending") {
      res.json({ index: queue.indexOf(id), ...toDo[id] });
      return;
    }
    res.json({ message: "submission done" });
  });

module.exports = router;
