import API_URL from "./api";

export async function createVacatingRequest(data: any) {
  const response = await fetch(`${API_URL}/Vacating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

export async function getVacatingRequests() {
  const response = await fetch(`${API_URL}/Vacating`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  return await response.json();
}

export async function approveVacating(id: number) {
  const response = await fetch(`${API_URL}/Vacating/approve/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  return await response.json();
}

export async function rejectVacating(id: number) {
  const response = await fetch(`${API_URL}/Vacating/reject/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  return await response.json();
}

export async function getStudentVacatingRequest(studentId: string) {
  const response = await fetch(`${API_URL}/Vacating/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  return await response.json();
}

export async function acknowledgeVacatingReject(id: number) {
  const response = await fetch(`${API_URL}/Vacating/acknowledge/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed");
  }
}