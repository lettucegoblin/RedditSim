// express.js
require('dotenv').config()
const path = require("path");

const express = require("express");
const subredditController = require("./controllers/subreddit");
const userController = require("./controllers/users");
const queueController = require("./controllers/queueInference");
const app = express();

const PORT = 3000;

app
  .use("/", express.static(path.join(__dirname, "../client/dist/")))
  .use(express.json())

  // CORS
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  })
  .use("/api/v1/me", (req, res, next) => {
    res.json({ message: "user profile" });
  })
  .use("/api/v1/queue", queueController)
  .use("/api/v1/subreddits", subredditController)
  .use("/api/v1/users", userController)
  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err?.status || 500).json({ message: err?.message || err });
});

console.log("1: Trying to start server...");

app.listen(PORT, () => {
  console.log(`2: Server is running at http://localhost:${PORT}`);
});

console.log("3: End of file, waiting for requests...");
