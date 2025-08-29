const { getPR } = require("../services/nlpSearch");

async function nlpSearchController(req, res) {
  try {
    const data = await getPR(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  nlpSearchController,
};
