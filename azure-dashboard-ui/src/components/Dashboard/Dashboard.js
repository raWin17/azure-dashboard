import React, { useEffect, useState } from "react";
import {
  getProjects,
  getRepositories,
  searchCode,
} from "../../api/azureDevOpsService";
import "./dashboard.css";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [query, setQuery] = useState("");
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fileExtension, setFileExtension] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        const sortedProjects = projectsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (selectedProject) {
        try {
          const repos = await getRepositories(selectedProject);
          const sortedRepos = repos.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setRepositories(sortedRepos);
          setFilteredRepos(sortedRepos);
        } catch (error) {
          console.error("Failed to fetch repositories:", error);
        }
      }
    };
    fetchRepositories();
  }, [selectedProject]);

  useEffect(() => {
    let filtered = repositories;
    if (query) {
      filtered = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredRepos(filtered);
  }, [query, repositories]);

  const ORG_NAME = "MetroBank";

  const handleSearchInRepos = async () => {
    if (!selectedProject || !query || !searchTerm) {
      setSearchError(
        "Please select a project, repository, and enter a search term."
      );
      return;
    }
    setSearching(true);
    setSearchResults([]);
    setSearchError("");
    try {
      const projectName =
        projects.find((p) => p.id === selectedProject)?.name ?? selectedProject;
      let searchQuery = searchTerm;
      if (fileExtension) {
        searchQuery = `${searchTerm} ${fileExtension}`.trim();
      }
      const codeSearchResults = await searchCode(
        ORG_NAME,
        projectName,
        searchQuery,
        query
      );
      let results = [];
      if (codeSearchResults && codeSearchResults.results) {
        results = codeSearchResults.results
          .filter(
            (result) => !fileExtension || result.path.endsWith(fileExtension)
          )
          .map((result) => ({
            repo: result.repository.name,
            file: result.path,
          }));
      }
      setSearchResults(results);
    } catch (err) {
      setSearchError("Error searching repositories.");
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const filteredResults = fileExtension
    ? searchResults.filter((result) => result.file.endsWith(fileExtension))
    : searchResults;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Azure DevOps Dashboard
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <FormControl fullWidth>
            <InputLabel id="project-select-label">Select Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setQuery("");
              }}
              label="Select Project"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="repo-select-label">Select Repository</InputLabel>
            <Select
              labelId="repo-select-label"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!selectedProject}
              label="Select Repository"
            >
              {repositories.map((repo) => (
                <MenuItem key={repo.id} value={repo.name}>
                  {repo.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          label="Search inside repositories (e.g. Java 8)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedProject || filteredRepos.length === 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm) handleSearchInRepos();
          }}
          helperText="Press Enter to search inside all listed repositories."
          sx={{ mb: 2 }}
        />
        <TextField
          label="Filter by file extension (e.g. .java)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={fileExtension}
          onChange={(e) => setFileExtension(e.target.value)}
          sx={{ mb: 2 }}
        />
        {searching && (
          <Box display="flex" alignItems="center" mt={2}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>
              Searching inside repositories...
            </Typography>
          </Box>
        )}
        {searchError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {searchError}
          </Alert>
        )}
        {searchResults.length > 0 && (
          <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 300 }}>
                      <b>Repository</b>
                    </TableCell>
                    <TableCell>
                      <b>File</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ minWidth: 200 }}>
                        {result.repo}
                      </TableCell>
                      <TableCell>{result.file}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
