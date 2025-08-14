const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export const getProjects = async () => {
  const res = await fetch(`${BACKEND_URL}/projects`);
  console.log("Fetching projects from:", `${BACKEND_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export const getRepositories = async (project) => {
  const res = await fetch(
    `${BACKEND_URL}/projects/${encodeURIComponent(project)}/repositories`
  );
  if (!res.ok) throw new Error("Failed to fetch repositories");
  return res.json();
};

export const getRepositoryContents = async (project, repoName) => {
  const res = await fetch(
    `${BACKEND_URL}/projects/${encodeURIComponent(
      project
    )}/repositories/${encodeURIComponent(repoName)}/contents`
  );
  if (res.status === 404) {
    console.error("Repository not found");
    return;
  } else if (!res.ok) throw new Error("Failed to fetch repository contents");
  return res.json();
};

export const searchCode = async (org, project, searchText, repoName) => {
  const res = await fetch(`${BACKEND_URL}/searchCode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ org, project, searchText, repoName }),
  });
  if (!res.ok) throw new Error("Failed to search code");
  return res.json();
};
