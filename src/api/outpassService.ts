import API_URL from "./api";

export async function getOutpasses() {
  const response = await fetch(
    `${API_URL}/Outpasses`
  );

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