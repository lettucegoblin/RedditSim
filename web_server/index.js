// express.js
require("dotenv").config();
const path = require("path");

const express = require("express");
const subredditController = require("./controllers/subreddit");
const userController = require("./controllers/users");
const queueController = require("./controllers/queueInference");
const {
  parseAuthorizationToken,
  requireUser,
} = require("./middleware/authorization");
const app = express();

const PORT = process.env.PORT || 3000;

app
  .use("/", express.static(path.join(__dirname, "../client/dist/")))
  .use(express.json())

  // CORS
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      return res.send(200);
    }
    next();
  })
  .use(parseAuthorizationToken)
  .use("/api/v1/queue", queueController)
  .use("/api/v1/subreddits", subredditController)
  .use("/api/v1/users", userController)
  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

app.use((err, req, res, next) => {
  console.error(err);
  const msg = {
    status: err.code || 500,
    error: err.message || "Internal Server Error",
    isSuccess: false,
  };
  res.status(msg.status).json(msg);
});

console.log("1: Trying to start server...");

app.listen(PORT, () => {
  console.log(`2: Server is running at http://localhost:${PORT}`);
});

console.log("3: End of file, waiting for requests...");
