export async function approveTransportStudent(id: number) {
  const response = await fetch(
    `http://192.168.0.167:5077/api/TransportRegistrations/approve/${id}`,
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
    `http://192.168.0.167:5077/api/TransportRegistrations/reject/${id}`,
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
    "http://192.168.0.167:5077/api/TransportRegistrations"
  );

  return await response.json();
}