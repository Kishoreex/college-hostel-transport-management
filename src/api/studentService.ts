export async function getStudentProfile(studentId: string) {
  const response = await fetch(
    `https://202.61.121.102:8443/api/Student/${studentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  return await response.json();
}
export async function uploadStudentProfilePhoto(
  studentId: string,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `https://202.61.121.102:8443/api/Student/${studentId}/profile-photo`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}