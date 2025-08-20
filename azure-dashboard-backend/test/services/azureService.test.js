const {
  getProjects,
  getRepositories,
  getRepositoryContents,
  searchCode,
} = require("../../src/services/azureService");
const axios = require("../../src/config/axiosInstance");
const xml2js = require("xml2js");

jest.mock("../../src/config/axiosInstance");

jest.mock("xml2js", () => ({
  Parser: jest.fn(() => ({
    parseStringPromise: jest.fn(),
  })),
}));

describe("AzureService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjects", () => {
    test("should fetch projects successfully", async () => {
      const mockProjects = [{ id: "1", name: "Project A" }];
      axios.get.mockResolvedValueOnce({ data: { value: mockProjects } }); //

      const projects = await getProjects();

      expect(axios.get).toHaveBeenCalledWith(`/_apis/projects?api-version=7.1`);
      expect(projects).toEqual(mockProjects);
    });

    test("should handle API errors when fetching projects", async () => {
      const mockError = new Error("Network Error"); //
      axios.get.mockRejectedValueOnce(mockError); //

      await expect(getProjects()).rejects.toThrow(mockError); //
      expect(axios.get).toHaveBeenCalledWith(`/_apis/projects?api-version=7.1`);
    });
  });

  describe("getRepositories", () => {
    const mockProject = "my-project";
    test("should fetch repositories successfully", async () => {
      const mockRepositories = [{ id: "repo1", name: "Repo 1" }];
      axios.get.mockResolvedValueOnce({ data: { value: mockRepositories } }); //

      const repositories = await getRepositories(mockProject);

      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/repositories?api-version=7.1`
      );
      expect(repositories).toEqual(mockRepositories);
    });

    test("should handle API errors when fetching repositories", async () => {
      const mockError = new Error("API Error"); //
      axios.get.mockRejectedValueOnce(mockError); //

      await expect(getRepositories(mockProject)).rejects.toThrow(mockError); //
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/repositories?api-version=7.1`
      );
    });
  });

  describe("getRepositoryContents", () => {
    const mockProject = "my-project";
    const mockRepoName = "my-repo";
    const mockXmlContent = `
      <project>
        <properties>
          <my.version>1.0.0</my.version>
        </properties>
        <parent>
          <artifactId>parent-artifact</artifactId>
          <version>2.0.0</version>
        </parent>
        <dependencies>
          <dependency>
            <artifactId>dep1</artifactId>
            <version>\${my.version}</version>
          </dependency>
          <dependency>
            <artifactId>dep2</artifactId>
            <version>3.0.0</version>
          </dependency>
        </dependencies>
      </project>
    `;
    const mockParsedDependencies = {
      parent: { artifactId: "parent-artifact", version: "2.0.0" },
      dependencies: [
        { artifactId: "dep1", version: "1.0.0" },
        { artifactId: "dep2", version: "3.0.0" },
      ],
    };

    test("should fetch repository contents and extract dependencies", async () => {
      axios.get.mockResolvedValueOnce({ data: mockXmlContent });
      // Mock the parseStringPromise method of xml2js.Parser.
      xml2js.Parser.mockImplementationOnce(() => ({
        parseStringPromise: jest.fn().mockResolvedValueOnce({
          project: {
            properties: [{ "my.version": ["1.0.0"] }],
            parent: [{ artifactId: ["parent-artifact"], version: ["2.0.0"] }],
            dependencies: [
              {
                dependency: [
                  { artifactId: ["dep1"], version: ["${my.version}"] },
                  { artifactId: ["dep2"], version: ["3.0.0"] },
                ],
              },
            ],
          },
        }),
      }));

      const dependencies = await getRepositoryContents(
        mockProject,
        mockRepoName
      );

      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/repositories/${mockRepoName}/items`,
        {
          params: {
            scopePath: "/pom.xml",
            recursionLevel: "full",
            $format: "text",
          },
        }
      );
      expect(dependencies).toEqual(mockParsedDependencies);
    });

    test("should handle API errors when fetching repository contents", async () => {
      const mockError = new Error("Repository Not Found"); //
      axios.get.mockRejectedValueOnce(mockError); //

      await expect(
        getRepositoryContents(mockProject, mockRepoName)
      ).rejects.toThrow(mockError); //
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/repositories/${mockRepoName}/items`,
        {
          params: {
            scopePath: "/pom.xml",
            recursionLevel: "full",
            $format: "text",
          },
        }
      );
    });

    test("should handle XML parsing errors", async () => {
      axios.get.mockResolvedValueOnce({ data: "invalid xml" });
      const mockParsingError = new Error("Failed to parse XML");
      xml2js.Parser.mockImplementationOnce(() => ({
        parseStringPromise: jest.fn().mockRejectedValueOnce(mockParsingError),
      }));

      await expect(
        getRepositoryContents(mockProject, mockRepoName)
      ).rejects.toThrow(mockParsingError);
    });
  });

  describe("searchCode", () => {
    const mockProject = "my-project";
    const mockSearchText = "searchTerm";
    const mockRepoName = "my-repo";
    const mockSearchResults = {
      results: [
        {
          repository: { name: mockRepoName },
          path: "path/to/file.js",
          content: "found searchTerm here",
        },
      ],
    };

    test("should search code successfully", async () => {
      axios.post.mockResolvedValueOnce({ data: mockSearchResults }); //

      const results = await searchCode(
        mockProject,
        mockSearchText,
        mockRepoName
      );

      expect(axios.post).toHaveBeenCalledWith(
        `https://almsearch.dev.azure.com/TestOrg/_apis/search/codesearchresults?api-version=7.1`,
        {
          searchText: mockSearchText,
          $skip: 0,
          $top: 1000,
          includeFacets: true,
          filters: {
            Project: [mockProject],
            Repository: [mockRepoName],
          },
        }
      );
      expect(results).toEqual(mockSearchResults);
    });

    test("should handle API errors when searching code", async () => {
      const mockError = new Error("Search Failed"); //
      axios.post.mockRejectedValueOnce(mockError); //

      await expect(
        searchCode(mockProject, mockSearchText, mockRepoName)
      ).rejects.toThrow(mockError); //
      expect(axios.post).toHaveBeenCalledWith(
        `https://almsearch.dev.azure.com/TestOrg/_apis/search/codesearchresults?api-version=7.1`,
        {
          searchText: mockSearchText,
          $skip: 0,
          $top: 1000,
          includeFacets: true,
          filters: {
            Project: [mockProject],
            Repository: [mockRepoName],
          },
        }
      );
    });
  });
});
