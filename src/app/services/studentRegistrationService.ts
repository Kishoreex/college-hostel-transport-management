import API_URL from "../../api/api";

export const getStudentRegistrations = async (
  college?: string | null
) => {
  const url = college
    ? `${API_URL}/StudentRegistrations/approved?college=${encodeURIComponent(college)}`
    : `${API_URL}/StudentRegistrations/approved`;

  console.log("=================================");
  console.log("APPROVED STUDENTS API");
  console.log("URL:", url);
  console.log("TOKEN EXISTS:", !!localStorage.getItem("authToken"));
  console.log("=================================");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  console.log(
    "APPROVED STUDENTS STATUS:",
    response.status
  );

  const text = await response.text();

  console.log(
    "APPROVED STUDENTS RESPONSE:",
    text
  );

  if (!response.ok) {
    throw new Error(
      `Student API failed: ${response.status} - ${text}`
    );
  }

  return JSON.parse(text);
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