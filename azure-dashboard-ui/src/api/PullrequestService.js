const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export const getPullRequests = async (project) => {
  const res = await fetch(
    `${BACKEND_URL}/projects/${encodeURIComponent(project)}/pullrequests`
  );
  if (!res.ok) throw new Error("Failed to fetch pull requests");
  return res.json();
};
