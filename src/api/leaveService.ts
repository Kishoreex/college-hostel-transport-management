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

export async function getLeaveRequests() {
  const response = await fetch(
    `${API_URL}/LeaveRequests`
  );

  return await response.json();
}

export async function approveLeave(id:number) {
  await fetch(
    `${API_URL}/LeaveRequests/approve/${id}`,
    {
      method: "POST"
    }
  );
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