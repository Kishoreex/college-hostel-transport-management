import API_URL from "./api";

export async function createVacatingRequest(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Vacating`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  return await response.json();
}

export async function getVacatingRequests() {
  const response = await fetch(
   `${API_URL}/api/VacatingRequest`
  );

  return await response.json();
}

export async function approveVacating(
  id: number
) {
  const response = await fetch(
    `${API_URL}/Vacating/approve/${id}`,
    {
      method: "PUT"
    }
  );

  return await response.json();
}

export async function rejectVacating(
  id: number
) {
  const response = await fetch(
    `${API_URL}/Vacating/reject/${id}`,
    {
      method: "PUT"
    }
  );

  return await response.json();
}
export async function getStudentVacatingRequest(
  studentId: string
) {
  const response = await fetch(
    `${API_URL}/Vacating/student/${studentId}`
  );

  return await response.json();
}
export async function acknowledgeVacatingReject(id: number) {

    const response = await fetch(
        `https://202.61.121.102:8443/api/Vacating/acknowledge/${id}`,
        {
            method: "PUT"
        }
    );

    if (!response.ok) {
        throw new Error("Failed");
    }

}