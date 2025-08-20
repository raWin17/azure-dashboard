const { getPullRequests } = require("../services/pullRequestService");

async function getPullRequestsController(req, res) {
  try {
    const { project } = req.params;
    const { status } = req.query;
    const data = await getPullRequests(project, status);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPullRequestsController,
};
