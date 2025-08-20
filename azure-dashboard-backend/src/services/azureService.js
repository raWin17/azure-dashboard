const axios = require("../config/axiosInstance");
const xml2js = require("xml2js");
const AZURE_ORG = process.env.AZURE_ORG || "<YOUR_ORG_NAME>";
async function getProjects() {
  try {
    const response = await axios.get(`/_apis/projects?api-version=7.1`);
    return response.data.value;
  } catch (error) {
    console.error(
      "[AzureService] getProjects error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}

async function getRepositories(project) {
  try {
    const response = await axios.get(
      `/${project}/_apis/git/repositories?api-version=7.1`
    );
    return response.data.value;
  } catch (error) {
    console.error(
      "[AzureService] getRepositories error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}

async function getRepositoryContents(project, repoName) {
  try {
    const response = await axios.get(
      `/${project}/_apis/git/repositories/${repoName}/items`,
      {
        params: {
          scopePath: "/pom.xml",
          recursionLevel: "full",
          $format: "text",
        },
      }
    );
    const dependencies = await extractDependencies(response.data);
    return dependencies;
  } catch (error) {
    console.error(
      "[AzureService] getRepositoryContents error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}

async function searchCode(project, searchText, repoName) {
  try {
    const url = `https://almsearch.dev.azure.com/${AZURE_ORG}/_apis/search/codesearchresults?api-version=7.1`;
    const body = {
      searchText,
      $skip: 0,
      $top: 1000,
      includeFacets: true,
      filters: {
        Project: [project],
        Repository: [repoName],
      },
    };
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    console.error(
      "[AzureService] searchCode error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}

const extractDependencies = async (xml) => {
  const parser = new xml2js.Parser();
  try {
    const result = await parser.parseStringPromise(xml);

    const properties = result.project.properties[0];
    const propertiesMap = {};
    for (const [key, value] of Object.entries(properties)) {
      propertiesMap[key] = value[0];
    }

    const parent = result.project.parent ? result.project.parent[0] : null;
    const parentArtifact = parent
      ? {
          artifactId: parent.artifactId[0],
          version: parent.version[0],
        }
      : null;

    const dependencies = result.project.dependencies[0].dependency;
    const extracted = dependencies.map((dep) => {
      const artifactId = dep.artifactId[0];
      let version = dep.version ? dep.version[0] : "Default";

      if (version.startsWith("${") && version.endsWith("}")) {
        const propKey = version.slice(2, -1);
        version = propertiesMap[propKey] || "N/A";
      }

      return { artifactId, version };
    });

    // Combine parent artifact with dependencies
    return { parent: parentArtifact, dependencies: extracted };
  } catch (err) {
    console.error("Error parsing XML:", err);
    throw err; // Rethrow the error for handling in the route
  }
};

module.exports = {
  getProjects,
  getRepositories,
  getRepositoryContents,
  searchCode,
};
