const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  getProjectsController,
  getRepositoriesController,
  getRepositoryContentsController,
  searchCodeController,
} = require("./controllers/projectController");
const {
  getPullRequestsController,
} = require("./controllers/PullrequestController");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.get("/projects", getProjectsController);
app.get("/projects/:project/repositories", getRepositoriesController);
app.get(
  "/projects/:project/repositories/:repoName/contents",
  getRepositoryContentsController
);
app.post("/searchCode", searchCodeController);
app.get("/projects/:project/pullRequests", getPullRequestsController);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
