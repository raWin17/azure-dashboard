const axios = require("../config/axiosInstance");

async function getPullRequests(project, prStatus) {
  try {
    const response = await axios.get(
      `/${project}/_apis/git/pullrequests?searchCriteria.status=${prStatus}`
    );
    const extractedData = extractFields(response.data.value, project);
    console.log("extractedData", extractedData[0]);
    return extractedData;
  } catch (error) {
    console.error(
      "[AzureService] getPullRequests error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}

const extractFields = (jsonArray, project) => {
  return jsonArray.map((item) => ({
    title: item.title,
    description: item.description,
    prLink:
      axios.defaults.baseURL +
      "/" +
      project +
      "/_git/" +
      item.repository.name +
      "/pullrequest/" +
      item.pullRequestId,
    createdByDisplayName: item.createdBy.displayName,
    creationDate: item.creationDate,
    completionDate: item.closedDate,
    reviewers: item.reviewers
      .map((reviewer) => reviewer.displayName)
      .filter((name) => name && !name.includes("\\"))
      .join(", "),
  }));
};

module.exports = {
  getPullRequests,
  extractFields,
};
