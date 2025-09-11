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
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";

const PullRequests = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [maxResults, setMaxResults] = useState("101");
  const [isFiltered, setIsFiltered] = useState(false);

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
  const buildGetPullRequestsParams = () => {
    console.log("isFiltered:", isFiltered);
    if (isFiltered && fromDate && toDate) {
      console.log(
        "Selected fromDate toISOString:",
        fromDate.startOf("day").toISOString()
      );
      console.log(
        "Selected To Date toISOString:",
        toDate.endOf("day").toISOString()
      );
      return [
        selectedProject,
        statusValue,
        maxResults,
        fromDate.startOf("day").toISOString(),
        toDate.endOf("day").toISOString(),
      ];
    } else {
      return [selectedProject, statusValue];
    }
  };
  const handleSubmit = () => {
    setShowContent(true);
    if ((selectedProject, statusValue)) {
      const fetchDetails = async () => {
        setLoading(true);
        setError("");
        setPullRequests([]);
        try {
          const repos = await getPullRequests(...buildGetPullRequestsParams());
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

  const handleChange = (event) => {
    setIsFiltered(event.target.checked);
    if (isFiltered) {
      setFromDate(dayjs());
      setToDate(dayjs());
      setMaxResults("101");
      setError("");
    }
  };
  const isDisabled = !selectedProject || !statusValue;

  const trimDescription = (description, maxLength = 100) => {
    if (description && typeof description === "string") {
      if (description.length > maxLength) {
        return description.substring(0, maxLength) + "...";
      }
      return description;
    }
    return "No description available";
  };
  const handleMaxResultsChange = (v) => {
    setMaxResults(v);
  };

  const onMaxResultsInput = (e) => {
    const v = e.target.value;
    // allow empty or digits only
    if (v === "" || /^\d*$/.test(v)) {
      handleMaxResultsChange(v);
    }
  };

  const onMaxResultsBlur = () => {
    if (maxResults === "") return;
    let n = parseInt(maxResults, 10);
    if (Number.isNaN(n)) return;
    const min = 1;
    const max = 1000;
    if (n < min) n = min;
    if (n > max) n = max;
    setMaxResults(String(n));
  };

  const onFromDateChange = (date) => {
    setFromDate(date);
    if (date && toDate && date.isAfter(toDate)) {
      setError('The "From Date" cannot be after the "To Date".');
    } else if (date?.isAfter(dayjs())) {
      setError('The "From Date" cannot be in the future.');
    } else {
      setError("");
    }
  };

  const onToDateChange = (date) => {
    setToDate(date);
    if (date && fromDate?.isAfter(date)) {
      setError('The "From Date" cannot be after the "To Date".');
    } else if (date?.isAfter(dayjs())) {
      setError('The "To Date" cannot be in the future.');
    } else {
      setError("");
    }
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Pull Requests
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                label="Select Project"
                onChange={(e) => {
                  setStatusValue("");
                  setShowContent(false);
                  setSelectedProject(e.target.value);
                  setIsFiltered(false);
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
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
          </Grid>

          <Grid size={12}>
            <FormGroup>
              {/* <FormLabel
                id="filter-by-label"
                color="secondary"
                sx={{ mb: 1 }}
                component="legend"
              >
                Filter by
              </FormLabel> */}
              <Grid container sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFiltered}
                      onChange={handleChange}
                      slotProps={{ input: { "aria-label": "controlled" } }}
                      disabled={isDisabled}
                    />
                  }
                  label="Filter"
                />
              </Grid>
              {isFiltered && (
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  {/* <Grid container> */}
                  {/* <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    > */}
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="en-gb"
                  >
                    <Grid size={4}>
                      <DatePicker
                        label="From Date"
                        disableFuture
                        defaultValue={dayjs()}
                        value={fromDate}
                        shouldDisableDate={(date) =>
                          toDate ? date.isAfter(toDate) : false
                        }
                        onChange={onFromDateChange}
                      />
                    </Grid>
                    <Grid size={4}>
                      <DatePicker
                        label="To Date"
                        disableFuture
                        defaultValue={dayjs()}
                        value={toDate}
                        shouldDisableDate={(date) =>
                          fromDate ? date.isBefore(fromDate) : false
                        }
                        onChange={onToDateChange}
                      />
                    </Grid>
                  </LocalizationProvider>
                  <Grid size={4}>
                    <TextField
                      label="Max Results"
                      value={maxResults}
                      onChange={onMaxResultsInput}
                      onBlur={onMaxResultsBlur}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      slotProps={{
                        input: {
                          inputMode: "numeric",
                          pattern: "\\d*",
                          min: 1,
                          max: 1000,
                        },
                      }}
                      // helperText={maxResults === "" ? "" : ""}
                    />
                  </Grid>
                  {/* </Box> */}
                </Grid>
                // </Grid>
              )}
            </FormGroup>
          </Grid>

          <Grid size={12} container justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<SendIcon />}
              disabled={isDisabled || error}
            >
              Submit
            </Button>
          </Grid>

          <Grid size={12}>
            {loading && (
              <Box display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
              </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Grid>

          <Grid size={12}>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pullRequests.length > 0 ? (
                        pullRequests.map((pr) => (
                          <TableRow key={pr.prLink}>
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
                              {trimDescription(pr.description, 100)}
                            </TableCell>
                            <TableCell>{pr.createdByDisplayName}</TableCell>
                            <TableCell>
                              {new Date(pr.creationDate).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>
                            No pull requests found.
                          </TableCell>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pullRequests.length > 0 ? (
                        pullRequests.map((pr) => (
                          <TableRow key={pr.prLink}>
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
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>
                            No pull requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PullRequests;
