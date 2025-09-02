const { getPullRequests } = require("../services/pullRequestService");

async function getPullRequestsController(req, res) {
  try {
    const { project, prStatus, maxResults, fromDate, toDate } = req.body;
    const data = await getPullRequests(
      project,
      prStatus,
      maxResults,
      fromDate,
      toDate
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPullRequestsController,
};
