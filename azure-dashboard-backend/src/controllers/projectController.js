const {
  getProjects,
  getRepositories,
  getRepositoryContents,
  searchCode,
} = require("../services/azureService");

async function getProjectsController(req, res) {
  try {
    const data = await getProjects();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRepositoriesController(req, res) {
  try {
    const { project } = req.params;
    const data = await getRepositories(project);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRepositoryContentsController(req, res) {
  try {
    const { project, repoName } = req.params;
    const data = await getRepositoryContents(project, repoName);
    res.json(data);
  } catch (error) {
    // need to enhance this
    res.status(500).json({ error: error.message });
  }
}

async function searchCodeController(req, res) {
  try {
    const { project, searchText, repoName } = req.body;
    const data = await searchCode(project, searchText, repoName);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getProjectsController,
  getRepositoriesController,
  getRepositoryContentsController,
  searchCodeController,
};
