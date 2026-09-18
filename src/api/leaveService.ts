import API_URL from "./api";

export async function createLeaveRequest(data:any) {
  const response = await fetch(
    `${API_URL}/LeaveRequests`,
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
export async function getLeaveRequests(
  college?: string | null
) {
  const url = college
    ? `${API_URL}/LeaveRequests?college=${encodeURIComponent(college)}`
    : `${API_URL}/LeaveRequests`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load leave requests");
  }

  return await response.json();
}

export async function approveLeave(id: number) {
  const response = await fetch(
    `${API_URL}/LeaveRequests/approve/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("APPROVE LEAVE FAILED:", response.status, data);

    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || `Approval failed (${response.status})`
    );
  }

  return data;
}
export async function rejectLeave(
  id: number,
  rejectReason: string
) {
  await fetch(
    `${API_URL}/LeaveRequests/reject/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rejectReason
      })
    }
  );
}
export async function cancelLeave(id: number) {
  await fetch(
    `${API_URL}/LeaveRequests/cancel/${id}`,
    {
      method: "POST"
    }
  );
}