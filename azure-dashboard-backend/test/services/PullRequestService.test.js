const {
  getPullRequests,
  extractFields,
} = require("../../src/services/pullRequestService");
const axios = require("../../src/config/AxiosInstance");

jest.mock("../../src/config/AxiosInstance");

describe("AzureService", () => {
  const mockProject = "my-project";
  const mockPullRequestData = [
    {
      title: "PR 1",
      description: "Description 1",
      repository: { name: "repo1" },
      pullRequestId: 123,
      createdBy: { displayName: "User 1" },
      creationDate: "2025-01-01T00:00:00Z",
    },
    {
      title: "PR 2",
      description: "Description 2",
      repository: { name: "repo2" },
      pullRequestId: 456,
      createdBy: { displayName: "User 2" },
      creationDate: "2025-01-02T00:00:00Z",
    },
  ];

  const mockExtractedPullRequests = [
    {
      title: "PR 1",
      description: "Description 1",
      prLink: "http://mock-base-url/my-project/_git/repo1/pullrequest/123",
      createdByDisplayName: "User 1",
      creationDate: "2025-01-01T00:00:00Z",
    },
    {
      title: "PR 2",
      description: "Description 2",
      prLink: "http://mock-base-url/my-project/_git/repo2/pullrequest/456",
      createdByDisplayName: "User 2",
      creationDate: "2025-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.defaults.baseURL = "http://mock-base-url";
  });

  describe("getPullRequests", () => {
    test("should fetch active pull requests and extract fields", async () => {
      axios.get.mockResolvedValueOnce({ data: { value: mockPullRequestData } }); //

      const result = await getPullRequests(mockProject);

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/pullrequests?searchCriteria.status=active`
      );
      expect(result).toEqual(mockExtractedPullRequests);
    });

    test("should handle API errors", async () => {
      const mockError = new Error("Network Error");
      axios.get.mockRejectedValueOnce(mockError); //

      await expect(getPullRequests(mockProject)).rejects.toThrow(mockError); //
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/pullrequests?searchCriteria.status=active`
      );
    });
  });

  describe("extractFields", () => {
    test("should correctly extract fields from pull request data", () => {
      const result = extractFields(mockPullRequestData, mockProject);
      expect(result).toEqual(mockExtractedPullRequests);
    });
  });
});
