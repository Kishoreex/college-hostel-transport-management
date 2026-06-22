import API_URL from "./api";

export async function getActivityLogs() {
  const response = await fetch(
    `${API_URL}/ActivityLogs`
  );

  return await response.json();
}