import API_URL from "../../api/api";
export async function getParentLeaves(parentUserId: string) {
  const response = await fetch(
    `https://202.61.121.102:8443/api/LeaveRequests/parent/${parentUserId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load leave history");
  }

  return await response.json();
}