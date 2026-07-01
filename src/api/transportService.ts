import API_URL from "./api";

export async function getTransportApplications() {
  const response = await fetch(
   `${API_URL}/TransportRegistrations`
  );

  return await response.json();
}

export async function approveTransportStudent(id: number) {
  const response = await fetch(
`${API_URL}/TransportRegistrations/approve/${id}`,
    {
      method: "POST",
    }
  );

if (!response.ok) {
    const error = await response.text();
    console.error(error);
    throw new Error(error);
}

  return await response.json();
}

export async function rejectTransportStudent(id: number) {
  const response = await fetch(
   `${API_URL}/TransportRegistrations/reject/${id}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) throw new Error("Reject Failed");

  return await response.json();
}

/* ---------------- ROUTES ---------------- */

export async function getRoutes() {
  const response = await fetch(
    `${API_URL}/TransportRoutes`
  );

  if (!response.ok)
    throw new Error("Failed to load routes");

  return await response.json();
}

export async function createRoute(data: any) {
  const response = await fetch(
    `${API_URL}/TransportRoutes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok)
    throw new Error("Create Route Failed");

  return await response.json();
}

export async function updateRoute(
  id: number,
  data: any
) {
  const response = await fetch(
   `${API_URL}/TransportRoutes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
if (!response.ok) {
    const error = await response.text();
    console.error(error);
    throw new Error(error);
}

  return await response.json();
}
export async function getTransportStudents() {
  const response = await fetch(
    `${API_URL}/TransportRegistrations/students`
  );

  if (!response.ok)
    throw new Error("Failed to load students");

  return await response.json();
}
export function downloadTransportReport(
    type: string,
    months: number = 12
) {
    window.open(
        `${API_URL}/TransportReports/export?type=${type}&months=${months}`,
        "_blank"
    );
}
export async function getStudentTransport(
  studentId: string
) {
  const response = await fetch(
    `${API_URL}/TransportRegistrations/student/${studentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load transport details");
  }

  return await response.json();
}
export async function submitTransportCancellation(
  studentId: string,
  studentName: string,
  reason: string
) {
  const response = await fetch(
    `${API_URL}/TransportCancellation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        studentName,
        reason,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}

export async function getTransportCancellation(
  studentId: string
) {
  const response = await fetch(
    `${API_URL}/TransportCancellation/${studentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load cancellation");
  }

  return await response.json();
}
export async function getTransportCancellationRequests() {
  const response = await fetch(
    `${API_URL}/TransportCancellation`
  );

  if (!response.ok)
    throw new Error("Failed to load cancellation requests");

  return await response.json();
}

export async function approveTransportCancellation(id: number) {
  const response = await fetch(
    `${API_URL}/TransportCancellation/approve/${id}`,
    {
      method: "POST",
    }
  );

  if (!response.ok)
    throw new Error("Approval failed");

  return await response.json();
}

export async function rejectTransportCancellation(id: number) {
  const response = await fetch(
    `${API_URL}/TransportCancellation/reject/${id}`,
    {
      method: "POST",
    }
  );

  if (!response.ok)
    throw new Error("Reject failed");

  return await response.json();
}