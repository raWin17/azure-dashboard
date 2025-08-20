import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import RepoDetails from "./components/Repo/RepoDetails";
import ProjectAdvancedDetails from "./components/ProjectAdvancedDetailsPage/ProjectAdvancedDetails";
import PullRequests from "./components/PullRequest/PullRequest";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MergeIcon from "@mui/icons-material/Merge";

const drawerWidth = 240;

function Sidebar() {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "#0060df",
          color: "#fff",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem
            component={Link}
            to="/"
            selected={location.pathname === "/"}
            sx={{
              background: location.pathname === "/" ? "#c21924" : undefined,
              color: "#fff",
              "&:hover": {
                background: "#c21924",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <FilterListIcon />
            </ListItemIcon>
            <ListItemText primary="Filter Projects" />
          </ListItem>
          <ListItem
            component={Link}
            to="/repo/details"
            selected={location.pathname === "/repo/details"}
            sx={{
              background:
                location.pathname === "/repo/details" ? "#c21924" : undefined,
              color: "#fff",
              "&:hover": {
                background: "#c21924",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Repo Details" />
          </ListItem>
          {/* <ListItem
            component={Link}
            to="/project/details"
            selected={location.pathname === "/project/details"}
            sx={{
              background:
                location.pathname === "/project/details"
                  ? "#c21924"
                  : undefined,
              color: "#fff",
              "&:hover": {
                background: "#c21924",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Advanced Metrics" />
          </ListItem> */}
          <ListItem
            component={Link}
            to="/pullRequests"
            selected={location.pathname === "/pullRequests"}
            sx={{
              background:
                location.pathname === "/pullRequests" ? "#c21924" : undefined,
              color: "#fff",
              "&:hover": {
                background: "#c21924",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              <MergeIcon />
            </ListItemIcon>
            <ListItemText primary="Pull Requests" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "#0060df",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                color: "#fff",
              }}
            >
              Azure Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f4f6fa",
            p: { xs: 1, sm: 3 },
            minHeight: "100vh",
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/repo/details" element={<RepoDetails />} />
            <Route
              path="/project/details"
              element={<ProjectAdvancedDetails />}
            />
            <Route path="/pullRequests" element={<PullRequests />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
