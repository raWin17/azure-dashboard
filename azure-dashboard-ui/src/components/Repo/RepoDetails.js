import React, { useEffect, useState } from "react";
import {
  getProjects,
  getRepositories,
  getRepositoryContents,
} from "../../api/azureDevOpsService";
import {
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material";

const RepoDetails = () => {
  const [projects, setProjects] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [dependenciesData, setDependenciesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        const sortedProjects = projectsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProjects(sortedProjects);
      } catch (err) {
        console.error("[RepoDetails] fetchProjects error:", err);
        setError("Failed to fetch projects.");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const fetchRepos = async () => {
        try {
          const repos = await getRepositories(selectedProject);
          const sortedRepos = repos.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setRepositories(sortedRepos);
        } catch (err) {
          console.error("[RepoDetails] fetchRepos error:", err);
          setError("Failed to fetch repositories.");
        }
      };
      fetchRepos();
    } else {
      setRepositories([]);
      setSelectedRepo("");
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedRepo) {
      const fetchDetails = async () => {
        setLoading(true);
        setError("");
        setDependenciesData(null);
        try {
          const dependencies = await getRepositoryContents(
            selectedProject,
            selectedRepo
          );
          setDependenciesData(dependencies);
        } catch (err) {
          console.error("[RepoDetails] fetchDetails error:", err);
          setError("Failed to load repository details.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDependenciesData(null);
    }
  }, [selectedProject, selectedRepo]);

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Repo Details
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Project</InputLabel>
          <Select
            value={selectedProject}
            label="Select Project"
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedRepo("");
            }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedProject}>
          <InputLabel>Select Repository</InputLabel>
          <Select
            value={selectedRepo}
            label="Select Repository"
            onChange={(e) => setSelectedRepo(e.target.value)}
          >
            {repositories.map((repo) => (
              <MenuItem key={repo.id} value={repo.name}>
                {repo.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading &&
          !error &&
          selectedRepo &&
          dependenciesData?.parent &&
          dependenciesData.dependencies && (
            <>
              {/* <Typography variant="h5" sx={{ mt: 2 }} align="center">
              Parent Dependency
            </Typography>
            <Typography align="center" sx={{ fontWeight: "bold" }}>
              {dependenciesData.parent.artifactId} -{" "}
              {dependenciesData.parent.version}
            </Typography> */}
              <Typography variant="h5" sx={{ mt: 2 }} align="center">
                Parent Dependency
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Artifact ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Version</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {dependenciesData.parent.artifactId}
                      </TableCell>
                      <TableCell>{dependenciesData.parent.version}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="h5" sx={{ mt: 2 }} align="center">
                Dependencies
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Artifact ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Version</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dependenciesData.dependencies
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((dep) => (
                        <TableRow key={dep.artifactId}>
                          <TableCell>{dep.artifactId}</TableCell>
                          <TableCell>{dep.version}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={dependenciesData.dependencies.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
      </Paper>
    </Container>
  );
};

export default RepoDetails;
