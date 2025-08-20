const request = require("supertest");
const express = require("express");
const {
  getPullRequestsController,
} = require("../../src/controllers/pullrequestController");

// Mock the azureService module
jest.mock("../../src/services/pullRequestService", () => ({
  getPullRequests: jest.fn(),
}));

const pullRequestService = require("../../src/services/pullRequestService");

const app = express();
app.use(express.json());

app.get("/projects/:project/pullRequests", getPullRequestsController);
describe("Azure DevOps Controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getPullRequestsController tests ---
  describe("getPullRequestsController", () => {
    it("should return a list of pull requests on success", async () => {
      const mockPullRequests = [{ id: "1", title: "Fix bug", status: "open" }];
      pullRequestService.getPullRequests.mockResolvedValue(mockPullRequests);

      const response = await request(app).get(
        "/projects/:project/pullRequests"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPullRequests);
      expect(pullRequestService.getPullRequests).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no pull requests are found", async () => {
      pullRequestService.getPullRequests.mockResolvedValue([]);

      const response = await request(app).get(
        "/projects/:project/pullRequests"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(pullRequestService.getPullRequests).toHaveBeenCalledTimes(1);
    });

    it("should return a 500 error if getPullRequests fails", async () => {
      const errorMessage = "Failed to fetch pull requests";
      pullRequestService.getPullRequests.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app).get(
        "/projects/:project/pullRequests"
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
      expect(pullRequestService.getPullRequests).toHaveBeenCalledTimes(1);
    });
  });
});
