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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

const ProjectAdvancedDetails = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [dependencies, setDependencies] = useState([]);
  const [lastCommitDate, setLastCommitDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (err) {
        setError(err?.message || "Failed to fetch projects.");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const fetchDetails = async () => {
        setLoading(true);
        setError("");
        setDependencies([]);
        setLastCommitDate("");
        try {
          // For advanced metrics, aggregate across all repos in the project
          const repos = await getRepositories(selectedProject);
          let allDeps = new Set();
          let latestCommit = null;
          for (const repo of repos) {
            const contents = await getRepositoryContents(
              selectedProject,
              repo.name
            );
            if (contents.value) {
              const pkg = contents.value.find((item) =>
                item.path.endsWith("package.json")
              );
              if (pkg) {
                allDeps.add(pkg.path);
              }
              if (contents.value[0] && contents.value[0].commitDate) {
                const commitDate = new Date(contents.value[0].commitDate);
                if (!latestCommit || commitDate > latestCommit) {
                  latestCommit = commitDate;
                }
              }
            }
          }
          setDependencies(Array.from(allDeps));
          setLastCommitDate(
            latestCommit ? latestCommit.toISOString().split("T")[0] : "N/A"
          );
        } catch (err) {
          setError(err?.message || "Failed to load repository details.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDependencies([]);
      setLastCommitDate("");
    }
  }, [selectedProject]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Advanced Metrics
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Project</InputLabel>
          <Select
            value={selectedProject}
            label="Select Project"
            onChange={(e) => {
              setSelectedProject(e.target.value);
            }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
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
        {!loading && !error && selectedProject && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Dependencies</Typography>
            <List>
              {dependencies.length > 0 ? (
                dependencies.map((dep) => (
                  <ListItem key={dep}>
                    <ListItemText primary={dep} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No dependencies found." />
                </ListItem>
              )}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Last Commit Date</Typography>
            <Typography>{lastCommitDate || "N/A"}</Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectAdvancedDetails;
