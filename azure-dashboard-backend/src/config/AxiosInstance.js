const axios = require("axios");

const AZURE_ORG = process.env.AZURE_ORG || "MetroBank";
const AZURE_PAT = process.env.AZURE_PAT || "";

if (!AZURE_PAT) {
  throw new Error(
    "Azure DevOps Personal Access Token (AZURE_PAT) is not set. Please set the AZURE_PAT environment variable."
  );
}

const instance = axios.create({
  baseURL: `https://dev.azure.com/${AZURE_ORG}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(":" + AZURE_PAT).toString("base64"),
  },
});

module.exports = instance;
