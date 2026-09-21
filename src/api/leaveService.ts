import API_URL from "./api";


// =====================================================
// CREATE LEAVE
// =====================================================

export async function createLeaveRequest(data: any) {

  const token =
    localStorage.getItem("authToken");

  const response = await fetch(
    `${API_URL}/LeaveRequests`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },

      body:
        JSON.stringify(data),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result?.message ||
      result?.title ||
      `Failed to create leave (${response.status})`
    );
  }

  return result;
}


// =====================================================
// GET ALL LEAVES
// =====================================================

export async function getLeaveRequests(
  college?: string | null
) {

  const url =
    college
      ? `${API_URL}/LeaveRequests?college=${encodeURIComponent(college)}`
      : `${API_URL}/LeaveRequests`;

  const token =
    localStorage.getItem("authToken");

  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },
    });

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result?.message ||
      result?.title ||
      `Failed to load leave requests (${response.status})`
    );
  }

  return result;
}


// =====================================================
// APPROVE LEAVE
// =====================================================

export async function approveLeave(
  id: number
) {

  const token =
    localStorage.getItem("authToken");

  const response =
    await fetch(
      `${API_URL}/LeaveRequests/approve/${id}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  const data =
    await response.json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.title ||
      `Approval failed (${response.status})`
    );
  }

  return data;
}


// =====================================================
// REJECT LEAVE
// =====================================================

export async function rejectLeave(
  id: number,
  rejectReason: string
) {

  const token =
    localStorage.getItem("authToken");

  const response =
    await fetch(
      `${API_URL}/LeaveRequests/reject/${id}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            rejectReason,
          }),
      }
    );

  const data =
    await response.json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.title ||
      `Rejection failed (${response.status})`
    );
  }

  return data;
}


// =====================================================
// CANCEL LEAVE
// =====================================================

export async function cancelLeave(
  id: number
) {

  const token =
    localStorage.getItem("authToken");

  const response =
    await fetch(
      `${API_URL}/LeaveRequests/cancel/${id}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  const data =
    await response.json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.title ||
      `Failed to cancel leave (${response.status})`
    );
  }

  return data;
}