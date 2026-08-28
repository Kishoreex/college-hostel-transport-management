import API_URL from "./api";

export async function getOutpasses(
  college?: string | null
) {
  const url = college
    ? `${API_URL}/Outpasses?college=${encodeURIComponent(college)}`
    : `${API_URL}/Outpasses`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load outpasses");
  }

  return await response.json();
}

export async function getStudentOutpasses(
  studentId:string
) {
  const response = await fetch(
    `${API_URL}/Outpasses/${studentId}`
  );

  return await response.json();
}