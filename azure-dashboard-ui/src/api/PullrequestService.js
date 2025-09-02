const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export const getPullRequests = async (
  project,
  prStatus,
  maxResults,
  fromDate,
  toDate
) => {
  const res = await fetch(`${BACKEND_URL}/pullrequests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, prStatus, maxResults, fromDate, toDate }),
  });
  if (!res.ok) throw new Error("Failed to search code");
  return res.json();
};
