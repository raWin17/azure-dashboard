// import React, { useEffect, useState } from "react";
// import {
//   getProjects,
//   getRepositories,
//   getRepositoryContents,
// } from "../api/azureDevOpsService";
// import {
//   Container,
//   Typography,
//   Paper,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Box,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   CircularProgress,
//   Alert,
// } from "@mui/material";

// const RepoDetails = () => {
//   const [projects, setProjects] = useState([]);
//   const [repositories, setRepositories] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedRepo, setSelectedRepo] = useState("");
//   const [dependencies, setDependencies] = useState([]);
//   const [lastCommitDate, setLastCommitDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projectsData = await getProjects();
//         setProjects(projectsData);
//       } catch (err) {
//         setError("Failed to fetch projects.");
//       }
//     };
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     if (selectedProject) {
//       const fetchRepos = async () => {
//         try {
//           const repos = await getRepositories(selectedProject);
//           setRepositories(repos);
//         } catch (err) {
//           setError("Failed to fetch repositories.");
//         }
//       };
//       fetchRepos();
//     } else {
//       setRepositories([]);
//       setSelectedRepo("");
//     }
//   }, [selectedProject]);

//   useEffect(() => {
//     if (selectedProject && selectedRepo) {
//       const fetchDetails = async () => {
//         setLoading(true);
//         setError("");
//         setDependencies([]);
//         setLastCommitDate("");
//         try {
//           const contents = await getRepositoryContents(
//             selectedProject,
//             selectedRepo
//           );
//           let deps = [];
//           let lastCommit = "";
//           if (contents.value) {
//             const pkg = contents.value.find((item) =>
//               item.path.endsWith("package.json")
//             );
//             if (pkg) {
//               // In a real app, fetch the actual package.json file content from backend
//               // Here, just show the filename for demo
//               deps = [pkg.path];
//             }
//             if (contents.value[0] && contents.value[0].commitId) {
//               lastCommit = contents.value[0].commitDate || "N/A";
//             }
//           }
//           setDependencies(deps);
//           setLastCommitDate(lastCommit);
//         } catch (err) {
//           setError("Failed to load repository details.");
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchDetails();
//     } else {
//       setDependencies([]);
//       setLastCommitDate("");
//     }
//   }, [selectedProject, selectedRepo]);

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Paper elevation={3} sx={{ p: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Repo Details
//         </Typography>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel>Select Project</InputLabel>
//           <Select
//             value={selectedProject}
//             label="Select Project"
//             onChange={(e) => {
//               setSelectedProject(e.target.value);
//               setSelectedRepo("");
//             }}
//           >
//             {projects.map((project) => (
//               <MenuItem key={project.id} value={project.id}>
//                 {project.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedProject}>
//           <InputLabel>Select Repository</InputLabel>
//           <Select
//             value={selectedRepo}
//             label="Select Repository"
//             onChange={(e) => setSelectedRepo(e.target.value)}
//           >
//             {repositories.map((repo) => (
//               <MenuItem key={repo.id} value={repo.name}>
//                 {repo.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         {loading && (
//           <Box display="flex" alignItems="center" justifyContent="center">
//             <CircularProgress />
//           </Box>
//         )}
//         {error && <Alert severity="error">{error}</Alert>}
//         {!loading && !error && selectedRepo && (
//           <>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Dependencies</Typography>
//             <List>
//               {dependencies.length > 0 ? (
//                 dependencies.map((dep) => (
//                   <ListItem key={dep}>
//                     <ListItemText primary={dep} />
//                   </ListItem>
//                 ))
//               ) : (
//                 <ListItem>
//                   <ListItemText primary="No dependencies found." />
//                 </ListItem>
//               )}
//             </List>
//             <Divider sx={{ my: 2 }} />
//             <Typography variant="h6">Last Commit Date</Typography>
//             <Typography>{lastCommitDate || "N/A"}</Typography>
//           </>
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default RepoDetails;
