const {
  getPullRequests,
  extractFields,
} = require("../../src/services/pullRequestService");
const axios = require("../../src/config/axiosInstance");

jest.mock("../../src/config/axiosInstance");

describe("AzureService", () => {
  const mockProject = "my-project";
  const mockStatus = "active";
  const mockCompletedStatus = "completed";
  const mockMaxResults = 10;
  const mockMinTime = "2025-09-02T22:59:59.999Z";
  const mockMaxTime = "2025-10-02T23:00:00.000Z";
  const mockPullRequestData = [
    {
      title: "PR 1",
      description: "Description 1",
      repository: { name: "repo1" },
      pullRequestId: 123,
      createdBy: { displayName: "User 1" },
      creationDate: "2025-01-01T00:00:00Z",
      closedDate: "2025-08-22T07:26:07.4026956Z",
      reviewers: [
        {
          displayName: "Person 1",
        },
        {
          displayName: "Person 2",
        },
      ],
    },
    {
      title: "PR 2",
      description: "Description 2",
      repository: { name: "repo2" },
      pullRequestId: 456,
      createdBy: { displayName: "User 2" },
      creationDate: "2025-01-02T00:00:00Z",
      closedDate: "2025-08-22T07:26:07.4026956Z",
      reviewers: [
        {
          displayName: "Person 3",
        },
        {
          displayName: "Person 4",
        },
      ],
    },
  ];

  const mockExtractedForCompletedPullRequests = [
    {
      title: "PR 1",
      description: "Description 1",
      prLink: "http://mock-base-url/my-project/_git/repo1/pullrequest/123",
      createdByDisplayName: "User 1",
      creationDate: "2025-01-01T00:00:00Z",
      completionDate: "2025-08-22T07:26:07.4026956Z",
      reviewers: "Person 1, Person 2",
    },
    {
      title: "PR 2",
      description: "Description 2",
      prLink: "http://mock-base-url/my-project/_git/repo2/pullrequest/456",
      createdByDisplayName: "User 2",
      creationDate: "2025-01-02T00:00:00Z",
      completionDate: "2025-08-22T07:26:07.4026956Z",
      reviewers: "Person 3, Person 4",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.defaults.baseURL = "http://mock-base-url";
  });

  describe("getPullRequests", () => {
    test("should fetch active pull requests and extract fields", async () => {
      axios.get.mockResolvedValueOnce({ data: { value: mockPullRequestData } });

      const result = await getPullRequests(
        mockProject,
        mockStatus,
        mockMaxResults,
        mockMinTime,
        mockMaxTime
      );

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/pullrequests?searchCriteria.maxTime=${mockMaxTime}&searchCriteria.minTime=${mockMinTime}&searchCriteria.status=${mockStatus}&$top=${mockMaxResults}`
      );
      expect(result[0].title).toEqual("PR 1");
      expect(result[0].description).toEqual("Description 1");
      expect(result[0].prLink).toEqual(
        "http://mock-base-url/my-project/_git/repo1/pullrequest/123"
      );
      expect(result[0].createdByDisplayName).toEqual("User 1");
      expect(result[0].creationDate).toEqual("2025-01-01T00:00:00Z");
    });

    test("should fetch completed pull requests and extract fields", async () => {
      axios.get.mockResolvedValueOnce({ data: { value: mockPullRequestData } });

      const result = await getPullRequests(
        mockProject,
        mockCompletedStatus,
        mockMaxResults,
        mockMinTime,
        mockMaxTime
      );

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/pullrequests?searchCriteria.maxTime=${mockMaxTime}&searchCriteria.minTime=${mockMinTime}&searchCriteria.status=${mockCompletedStatus}&$top=${mockMaxResults}`
      );
      expect(result[0].title).toEqual("PR 1");
      expect(result[0].description).toEqual("Description 1");
      expect(result[0].prLink).toEqual(
        "http://mock-base-url/my-project/_git/repo1/pullrequest/123"
      );
      expect(result[0].createdByDisplayName).toEqual("User 1");
      expect(result[0].creationDate).toEqual("2025-01-01T00:00:00Z");
      expect(result[0].createdByDisplayName).toEqual("User 1");
      expect(result[0].creationDate).toEqual("2025-01-01T00:00:00Z");
    });

    test("should handle API errors", async () => {
      const mockError = new Error("Network Error");
      axios.get.mockRejectedValueOnce(mockError);

      await expect(
        getPullRequests(
          mockProject,
          mockStatus,
          mockMaxResults,
          mockMinTime,
          mockMaxTime
        )
      ).rejects.toThrow(mockError);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `/${mockProject}/_apis/git/pullrequests?searchCriteria.maxTime=${mockMaxTime}&searchCriteria.minTime=${mockMinTime}&searchCriteria.status=${mockStatus}&$top=${mockMaxResults}`
      );
    });
  });

  describe("extractFields", () => {
    test("should correctly extract fields from active pull request data", () => {
      const result = extractFields(mockPullRequestData, mockProject);
      expect(result[0].title).toEqual("PR 1");
      expect(result[0].description).toEqual("Description 1");
      expect(result[0].prLink).toEqual(
        "http://mock-base-url/my-project/_git/repo1/pullrequest/123"
      );
      expect(result[0].createdByDisplayName).toEqual("User 1");
      expect(result[0].creationDate).toEqual("2025-01-01T00:00:00Z");
    });
  });
  describe("extractFields", () => {
    test("should correctly extract fields from completed pull request data", () => {
      const result = extractFields(mockPullRequestData, mockProject);
      expect(result).toEqual(mockExtractedForCompletedPullRequests);
    });
  });
});
