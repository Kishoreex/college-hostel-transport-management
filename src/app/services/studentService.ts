export async function getStudent(studentId: string) {
  const response = await fetch(
    `https://api.madhapharma.in/api/student/${studentId}`
  );

  if (!response.ok)
    throw new Error("Failed");

  return await response.json();
}