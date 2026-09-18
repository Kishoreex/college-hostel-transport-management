import API_URL from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

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
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `Failed to approve leave (${response.status})`
    );
  }

  return await response.json();
}

export async function rejectLeave(
  id: number,
  rejectReason: string
) {
  const response = await fetch(
    `${API_URL}/LeaveRequests/reject/${id}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        rejectReason
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `Failed to reject leave (${response.status})`
    );
  }

  return await response.json();
}
export async function cancelLeave(id: number) {
  const response = await fetch(
    `${API_URL}/LeaveRequests/cancel/${id}`,
    {
      method: "POST",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `Failed to cancel leave (${response.status})`
    );
  }

  return await response.json();
}