const API_URL = "https://api.madhapharma.in/api";


export async function createLeaveRequest(data: any) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_URL}/LeaveRequests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.title ||
      `Failed to create leave request (${response.status})`
    );
  }

  return result;
}


export async function getLeaveRequests(
  college?: string | null
) {
  const url = college
    ? `${API_URL}/LeaveRequests?college=${encodeURIComponent(college)}`
    : `${API_URL}/LeaveRequests`;

  const token = localStorage.getItem("authToken");

  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.title ||
      `Failed to load leave requests (${response.status})`
    );
  }

  return result;
}


export async function approveLeave(id: number) {
  const token = localStorage.getItem("authToken");

  console.log("========== APPROVE LEAVE ==========");
  console.log("ID:", id);
  console.log("TOKEN EXISTS:", !!token);

  const response = await fetch(
    `${API_URL}/LeaveRequests/approve/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json().catch(() => null);

  console.log(
    "APPROVE LEAVE RESPONSE:",
    response.status,
    data
  );

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message ||
          data?.title ||
          `Approval failed (${response.status})`
    );
  }

  return data;
}


export async function rejectLeave(
  id: number,
  rejectReason: string
) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_URL}/LeaveRequests/reject/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rejectReason,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message ||
          data?.title ||
          `Rejection failed (${response.status})`
    );
  }

  return data;
}


export async function cancelLeave(id: number) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_URL}/LeaveRequests/cancel/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.title ||
      `Failed to cancel leave (${response.status})`
    );
  }

  return data;
}