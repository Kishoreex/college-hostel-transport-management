import API_URL from "../../api/api";

export async function getStudentTransport(studentId: string) {
  const response = await fetch(
    `${API_URL}/TransportRegistrations/student/${studentId}`
  );

  if (!response.ok)
    throw new Error("Failed to load transport details");

  return await response.json();
}