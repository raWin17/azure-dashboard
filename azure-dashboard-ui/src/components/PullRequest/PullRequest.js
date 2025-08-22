import React, { useEffect, useState } from "react";
import { getProjects } from "../../api/azureDevOpsService";
import { getPullRequests } from "../../api/PullrequestService";
import {
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const PullRequests = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        const sortedProjects = projectsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProjects(sortedProjects);
      } catch (err) {
        setError(err?.message || "Failed to fetch projects.");
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = () => {
    setShowContent(true);
    if ((selectedProject, statusValue)) {
      const fetchDetails = async () => {
        setLoading(true);
        setError("");
        setPullRequests([]);
        try {
          const repos = await getPullRequests(selectedProject, statusValue);
          setPullRequests(repos);
        } catch (err) {
          setError(err?.message || "Failed to load pull requests.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setPullRequests([]);
    }
  };

  const isSubmitDisabled = !selectedProject || !statusValue;

  const trimDescription = (description, maxLength = 100) => {
    if (description && typeof description === "string") {
      if (description.length > maxLength) {
        return description.substring(0, maxLength) + "...";
      }
      return description;
    }
    return "No description available";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Pull Requests
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Project</InputLabel>
          <Select
            value={selectedProject}
            label="Select Project"
            onChange={(e) => {
              setStatusValue("");
              setShowContent(false);
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Status</InputLabel>
          <Select
            value={statusValue}
            onChange={(e) => {
              setShowContent(false);
              setStatusValue(e.target.value);
            }}
            label="Select Status"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="abandoned">Abandoned</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSubmit}
            endIcon={<SendIcon />}
            disabled={isSubmitDisabled}
          >
            Submit
          </Button>
        </Grid>
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading &&
          !error &&
          selectedProject &&
          showContent &&
          statusValue !== "completed" && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Title
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Description
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Created By
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Creation Date
                    </TableCell>
                    {/* <TableCell align="center">Link</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pullRequests.length > 0 ? (
                    pullRequests.map((pr) => (
                      <TableRow key={pr.prLink}>
                        {/* <TableCell>{pr.title}</TableCell> */}
                        <TableCell>
                          <a
                            href={pr.prLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {pr.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          {" "}
                          {trimDescription(pr.description, 100)}
                        </TableCell>
                        <TableCell>{pr.createdByDisplayName}</TableCell>
                        <TableCell>
                          {new Date(pr.creationDate).toLocaleString()}
                        </TableCell>
                        {/* <TableCell>
                        <a
                          href={pr.prLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Pull Request
                        </a>
                      </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No pull requests found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        {!loading &&
          !error &&
          selectedProject &&
          showContent &&
          statusValue === "completed" && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Title
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Created By
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Creation Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Completion Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Reviewers
                    </TableCell>
                    {/* <TableCell align="center">Link</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pullRequests.length > 0 ? (
                    pullRequests.map((pr) => (
                      <TableRow key={pr.prLink}>
                        {/* <TableCell>{pr.title}</TableCell> */}
                        <TableCell>
                          <a
                            href={pr.prLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {pr.title}
                          </a>
                        </TableCell>
                        <TableCell>{pr.createdByDisplayName}</TableCell>
                        <TableCell>
                          {new Date(pr.creationDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(pr.completionDate).toLocaleString()}
                        </TableCell>
                        <TableCell>{pr.reviewers}</TableCell>
                        {/* <TableCell>
                        <a
                          href={pr.prLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Pull Request
                        </a>
                      </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No pull requests found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
      </Paper>
    </Container>
  );
};

export default PullRequests;
