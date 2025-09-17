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
  CircularProgress,
  Alert,
  Button,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Link,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
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
  const applyRange = (start, end) => {
    setIsFiltered(true);
    setFromDate(start);
    setToDate(end);
    setError("");
    // Auto-submit only when required selectors are chosen
    if (selectedProject && statusValue) {
      // ensure content shows and then fetch
      setShowContent(true);
      handleSubmit();
    }
  };
  const monthToDate = () => {
    const start = dayjs().startOf("month");
    const end = dayjs();
    applyRange(start, end);
  };
  const weekToDate = () => {
    const start = dayjs().startOf("week");
    const end = dayjs();
    applyRange(start, end);
  };

  const lastWeek = () => {
    // previous full calendar week (Sunday-Saturday)
    const start = dayjs().startOf("week").subtract(1, "week");
    const end = dayjs().startOf("week").subtract(1, "day");
    applyRange(start, end);
  };

  const lastMonth = () => {
    const start = dayjs().subtract(1, "month").startOf("month");
    const end = dayjs().subtract(1, "month").endOf("month");
    applyRange(start, end);
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      headerAlign: "center",
      align: "left",
      flex: 1,
      renderCell: (params) => (
        <Link
          href={params.row.prLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      headerAlign: "center",
      flex: 1,
      valueGetter: (value) => trimDescription(value, 100),
    },
    {
      field: "createdByDisplayName",
      headerName: "Created By",
      headerAlign: "center",
      flex: 0.6,
    },
    {
      field: "creationDate",
      headerName: "Creation Date",
      headerAlign: "center",
      flex: 0.65,
      valueGetter: (value) => dayjs(value).format("D MMM YYYY, h:mm A"),
    },
  ];

  const rows = pullRequests.map((pr, index) => ({
    id: pr.prLink, // Use prLink as a unique identifier
    title: pr.title,
    prLink: pr.prLink,
    description: pr.description,
    createdByDisplayName: pr.createdByDisplayName,
    creationDate: pr.creationDate,
  }));

  const columnsOfCompletedPR = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <Link
          href={params.row.prLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "createdByDisplayName",
      headerName: "Created By",
      flex: 0.75,
      headerAlign: "center",
    },
    {
      field: "creationDate",
      headerName: "Creation Date",
      flex: 1,
      headerAlign: "center",
      valueGetter: (value) => dayjs(value).format("D MMM YYYY, h:mm A"), // Format the date
    },
    {
      field: "completionDate",
      headerName: "Completion Date",
      flex: 1,
      headerAlign: "center",
      valueGetter: (value) => dayjs(value).format("D MMM YYYY, h:mm A"),
    },
    {
      field: "reviewers",
      headerName: "Reviewers",
      flex: 1,
      headerAlign: "center",
    },
  ];

  const rowsOfCompletedPR = pullRequests.map((pr) => ({
    id: pr.prLink, // Use prLink as a unique identifier
    title: pr.title,
    prLink: pr.prLink,
    createdByDisplayName: pr.createdByDisplayName,
    creationDate: pr.creationDate,
    completionDate: pr.completionDate,
    reviewers: pr.reviewers,
  }));

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
                  <Grid size={12}>
                    <Link
                      onClick={() => {
                        monthToDate();
                      }}
                      underline="hover"
                    >
                      Month to Date
                    </Link>
                    <Link
                      onClick={() => {
                        weekToDate();
                      }}
                      underline="hover"
                    >
                      Month to Date
                    </Link>
                  </Grid>
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
                <div style={{ height: 400, width: "100%" }}>
                  {pullRequests.length > 0 ? (
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      disableRowSelectionOnClick={true}
                      showToolbar
                      sx={{
                        // Styling for the bold header text
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: "bold",
                        },
                        // Center the cell content for all columns
                        "& .MuiDataGrid-cell": {
                          textAlign: "center",
                        },
                      }}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 25 },
                        },
                      }}
                    />
                  ) : (
                    <p>No pull requests found.</p>
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              selectedProject &&
              showContent &&
              statusValue === "completed" && (
                <div style={{ height: 400, width: "100%" }}>
                  {pullRequests.length > 0 ? (
                    <DataGrid
                      rows={rowsOfCompletedPR}
                      columns={columnsOfCompletedPR}
                      showToolbar
                      sx={{
                        // Styling for the bold header text
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: "bold",
                        },
                        // Center the cell content for all columns
                        "& .MuiDataGrid-cell": {
                          textAlign: "center",
                        },
                      }}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 25 },
                        },
                      }}
                    />
                  ) : (
                    <p>No pull requests found.</p>
                  )}
                </div>
              )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PullRequests;
