import API_URL from "../../api/api";

export const getAllVacatingRequests = async (college?: string | null) => {
  const url = college
    ? `${API_URL}/Vacating?college=${encodeURIComponent(college)}`
    : `${API_URL}/Vacating`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load vacating requests");
  }

  return await response.json();
};

export const approveVacatingRequest = async (id: number) => {
  await fetch(`${API_URL}/Vacating/approve/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
};

export const rejectVacatingRequest = async (id: number) => {
  await fetch(`${API_URL}/Vacating/reject/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
};