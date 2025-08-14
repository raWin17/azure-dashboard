const axios = require("../config/AxiosInstance");

async function getPullRequests(project) {
  try {
    const response = await axios.get(
      `/${project}/_apis/git/pullrequests?searchCriteria.status=active`
    );
    const extractedData = extractFields(response.data.value, project);
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
  }));
};

module.exports = {
  getPullRequests,
  extractFields,
};
