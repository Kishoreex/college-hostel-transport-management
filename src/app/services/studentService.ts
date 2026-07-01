export async function getStudent(studentId: string) {
  const response = await fetch(
    `https://202.61.121.102:8443/api/student/${studentId}`
  );

  if (!response.ok)
    throw new Error("Failed");

  return await response.json();
}