// const express = require("express");
// const axios = require("axios");
// const { getPullRequests } = require("../services/pullRequestService");
const nlp = require("compromise"); // Import the NLP library
// const

// const app = express();
// app.use(express.json());

// app.post("/api/search-prs", async (req, res) => {
async function getPR(req) {
  const { query } = req.body;

  // 1. NLP Processing using compromise:
  let status = "active";
  let projectName = "";

  const doc = nlp(query);

  // Extract status:
  if (doc.has("open")) {
    status = "active";
  } else if (doc.has("closed")) {
    status = "completed";
  }

  console.log("Extracted Status:", status);
  // Extract repository name:
  const projectMentions = doc.matchOne("#Noun #Noun").text("Java project");
  console.log("Project Mentions:", projectMentions);
  if (projectMentions.found) {
    projectName = projectMentions.out("array")[0]; // Assuming only one project mention
    console.log("Extracted Project Name:", projectName);
    // return getPullRequests(projectName, status);

    // You'd likely need more robust logic here to map "Java project" to your specific repo ID or name
  }

  //   // 2. Construct Azure DevOps API request (rest remains largely the same):
  //   const organization = process.env.AZURE_DEVOPS_ORG;
  //   const projectName = process.env.AZURE_DEVOPS_PROJECT;
  //   const token = process.env.AZURE_DEVOPS_PAT;

  //   try {
  //     const response = await axios.get(
  //       `https://dev.azure.com/${organization}/${projectName}/_apis/git/repositories/${repositoryName}/pullrequests?api-version=7.1&status=${status}`,
  //       {
  //         headers: {
  //           Authorization: `Basic ${Buffer.from(`:${token}`).toString('base64')}`,
  //         },
  //       }
  //     );
  //     res.json(response.data.value);
  //   } catch (error) {
  //     console.error('Error calling Azure DevOps API:', error);
  //     res.status(500).json({ error: 'Failed to fetch pull requests' });
  //   }
}

module.exports = {
  getPR,
};
