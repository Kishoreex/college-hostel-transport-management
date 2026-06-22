import API_URL from "./api";

export async function approveTransportStudent(id: number) {
  const response = await fetch(
    `${API_URL}/api/TransportRegistrations/approve/${id}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error("Approval Failed");
  }

  return await response.json();
}

export async function rejectTransportStudent(id: number) {
  const response = await fetch(
    `${API_URL}/api/TransportRegistrations/reject/${id}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error("Reject Failed");
  }

  return await response.json();
}
export async function getTransportApplications() {
  const response = await fetch(
    `${API_URL}/api/TransportRegistrations`
  );

  return await response.json();
}