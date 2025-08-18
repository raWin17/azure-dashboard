const request = require("supertest");
const express = require("express");
const {
  getProjectsController,
  getRepositoriesController,
  getRepositoryContentsController,
  searchCodeController,
} = require("../../src/controllers/projectController");

// Mock the azureService module
jest.mock("../../src/services/azureService", () => ({
  getProjects: jest.fn(),
  getRepositories: jest.fn(),
  getRepositoryContents: jest.fn(),
  searchCode: jest.fn(),
}));

const azureService = require("../../src/services/azureService");

const app = express();
app.use(express.json());

// Define test routes using your controllers
app.get("/projects", getProjectsController);
app.get("/projects/:project/repositories", getRepositoriesController);
app.get(
  "/projects/:project/repositories/:repoName/contents",
  getRepositoryContentsController
);
app.post("/search", searchCodeController);

describe("Azure DevOps Controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- getProjectsController tests ---
  describe("getProjectsController", () => {
    it("should return a list of projects on success", async () => {
      const mockProjects = [{ id: "1", name: "Project Alpha" }];
      azureService.getProjects.mockResolvedValue(mockProjects);

      const response = await request(app).get("/projects");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjects);
      expect(azureService.getProjects).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no projects are found", async () => {
      azureService.getProjects.mockResolvedValue([]);

      const response = await request(app).get("/projects");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(azureService.getProjects).toHaveBeenCalledTimes(1);
    });

    it("should return a 500 error if getProjects fails", async () => {
      const errorMessage = "Failed to fetch projects";
      azureService.getProjects.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get("/projects");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
      expect(azureService.getProjects).toHaveBeenCalledTimes(1);
    });
  });

  // --- getRepositoriesController tests ---
  describe("getRepositoriesController", () => {
    it("should return a list of repositories for a given project", async () => {
      const project = "testProject";
      const mockRepositories = [{ id: "repo1", name: "Repo A" }];
      azureService.getRepositories.mockResolvedValue(mockRepositories);

      const response = await request(app).get(
        `/projects/${project}/repositories`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories);
      expect(azureService.getRepositories).toHaveBeenCalledTimes(1);
      expect(azureService.getRepositories).toHaveBeenCalledWith(project);
    });

    it("should return a 500 error if getRepositories fails", async () => {
      const project = "testProject";
      const errorMessage = "Failed to fetch repositories";
      azureService.getRepositories.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get(
        `/projects/${project}/repositories`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
      expect(azureService.getRepositories).toHaveBeenCalledTimes(1);
      expect(azureService.getRepositories).toHaveBeenCalledWith(project);
    });
  });

  // --- getRepositoryContentsController tests ---
  describe("getRepositoryContentsController", () => {
    it("should return the content of a repository", async () => {
      const project = "testProject";
      const repoName = "testRepo";
      const mockContent = "file content here";
      azureService.getRepositoryContents.mockResolvedValue(mockContent);

      const response = await request(app).get(
        `/projects/${project}/repositories/${repoName}/contents`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContent);
      expect(azureService.getRepositoryContents).toHaveBeenCalledTimes(1);
      expect(azureService.getRepositoryContents).toHaveBeenCalledWith(
        project,
        repoName
      );
    });

    it("should return a 500 error if getRepositoryContents fails", async () => {
      const project = "testProject";
      const repoName = "testRepo";
      const errorMessage = "Failed to get repository content";
      azureService.getRepositoryContents.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app).get(
        `/projects/${project}/repositories/${repoName}/contents`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
      expect(azureService.getRepositoryContents).toHaveBeenCalledTimes(1);
      expect(azureService.getRepositoryContents).toHaveBeenCalledWith(
        project,
        repoName
      );
    });
  });

  // --- searchCodeController tests ---
  describe("searchCodeController", () => {
    const mockRequestBody = {
      org: "myOrg",
      project: "myProject",
      searchText: "console.log",
      repoName: "myRepo",
    };

    const mockSearchResults = [
      {
        fileName: "index.js",
        repository: "myRepo",
        content: 'console.log("hello")',
      },
    ];

    it("should return search results when the service call is successful", async () => {
      azureService.searchCode.mockResolvedValueOnce(mockSearchResults);

      const res = await request(app).post("/search").send(mockRequestBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSearchResults);
      expect(azureService.searchCode).toHaveBeenCalledTimes(1);
      expect(azureService.searchCode).toHaveBeenCalledWith(
        mockRequestBody.org,
        mockRequestBody.project,
        mockRequestBody.searchText,
        mockRequestBody.repoName
      );
    });

    it("should handle errors when the service call fails", async () => {
      const errorMessage = "Failed to search code";
      azureService.searchCode.mockRejectedValueOnce(new Error(errorMessage));

      const res = await request(app).post("/search").send(mockRequestBody);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: errorMessage });
      expect(azureService.searchCode).toHaveBeenCalledTimes(1);
      expect(azureService.searchCode).toHaveBeenCalledWith(
        mockRequestBody.org,
        mockRequestBody.project,
        mockRequestBody.searchText,
        mockRequestBody.repoName
      );
    });
  });
});
