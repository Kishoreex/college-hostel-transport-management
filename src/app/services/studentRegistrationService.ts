import API_URL from "../../api/api";

export const getStudentRegistrations = async (
  college?: string | null
) => {
  const url = college
    ? `${API_URL}/StudentRegistrations/approved?college=${encodeURIComponent(college)}`
    : `${API_URL}/StudentRegistrations/approved`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "FAILED TO LOAD APPROVED STUDENTS:",
      response.status,
      errorText
    );

    throw new Error(
      `Failed to load students (${response.status})`
    );
  }

  return await response.json();
};

export const getAllStudentRegistrations = async (
  college?: string | null
) => {
  const url = college
    ? `${API_URL}/StudentRegistrations?college=${encodeURIComponent(college)}`
    : `${API_URL}/StudentRegistrations`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load registrations");
  }

  return await response.json();
};