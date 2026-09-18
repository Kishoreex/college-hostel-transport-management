import API_URL from "../../api/api";

export const getStudentRegistrations = async (college?: string | null) => {
  const url = college
    ? `${API_URL}/StudentRegistrations/approved?college=${encodeURIComponent(college)}`
    : `${API_URL}/StudentRegistrations/approved`;

  const token = localStorage.getItem("authToken");

  console.log("=================================");
  console.log("APPROVED STUDENTS API");
  console.log("URL:", url);
  console.log("TOKEN EXISTS:", !!token);
  console.log("TOKEN LENGTH:", token?.length);
  console.log("=================================");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("APPROVED STUDENTS STATUS:", response.status);
    console.log("APPROVED STUDENTS OK:", response.ok);

    const text = await response.text();

    console.log("APPROVED STUDENTS RAW RESPONSE:", text);

    if (!response.ok) {
      throw new Error(
        `Student API failed: ${response.status} ${text}`
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Student API returned invalid JSON");
    }

    console.log("APPROVED STUDENTS PARSED:", data);
    console.log(
      "APPROVED STUDENTS COUNT:",
      Array.isArray(data) ? data.length : "NOT ARRAY"
    );

    return data;
  } catch (error) {
    console.error("========== APPROVED STUDENTS API ERROR ==========");
    console.error(error);
    throw error;
  }
};