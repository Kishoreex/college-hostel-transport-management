import API_URL from "../../api/api";
export async function getParentLeaves(parentUserId: string) {
  const response = await fetch(
    `https://api.madhapharma.in/api/LeaveRequests/parent/${parentUserId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load leave history");
  }

  return await response.json();
}