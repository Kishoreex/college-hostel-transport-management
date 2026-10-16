export async function getStudentProfile(studentId: string) {
  const response = await fetch(
    `https://api.madhapharma.in/api/Student/${studentId}`
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
  const token = localStorage.getItem("authToken");
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `https://api.madhapharma.in/api/Student/${encodeURIComponent(studentId)}/profile-photo`,
    {
      method: "POST",
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: formData,
    }
  );

  const text = await response.text();
  let result: any;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.title ||
      (typeof result === "string" ? result : null) ||
      `Photo upload failed (${response.status})`
    );
  }

  return result;
}
