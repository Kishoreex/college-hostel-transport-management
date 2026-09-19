
export async function getOutpasses(
  college?: string | null
) {
  const url = college
    ? `${API_URL}/Outpasses?college=${encodeURIComponent(college)}`
    : `${API_URL}/Outpasses`;

const token = localStorage.getItem("authToken");

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

  if (!response.ok) {
    throw new Error("Failed to load outpasses");
  }

  return await response.json();
}


const API_URL = "https://api.madhapharma.in/api";

export const createOutpass = async (data: any) => {
const response = await fetch(`${API_URL}/Outpasses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create outpass");
  }

  return response.json();
};

export const getStudentOutpasses =
async (studentId: string) => {

  const response = await fetch(
    `${API_URL}/Outpasses/${studentId}`
  );

  return response.json();
};

export const getAllOutpasses = async (
  college?: string | null
) => {
  const url = college
    ? `${API_URL}/Outpasses?college=${encodeURIComponent(college)}`
    : `${API_URL}/Outpasses`;

  const token = localStorage.getItem("authToken");

  console.log("========== OUTPASS REQUEST ==========");
  console.log("URL:", url);
  console.log("TOKEN EXISTS:", !!token);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load outpasses (${response.status})`
    );
  }

  return await response.json();
};
export const approveOutpass = async (
  id: number
) => {
  const token = localStorage.getItem("authToken");

  console.log("========== APPROVE OUTPASS ==========");
  console.log("ID:", id);
  console.log("TOKEN EXISTS:", !!token);

  const response = await fetch(
    `${API_URL}/Outpasses/approve/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("APPROVE RESPONSE:", response.status, data);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.title ||
      `Approval failed (${response.status})`
    );
  }

  return data;
};

export const rejectOutpass = async (
  id: number,
  rejectReason: string
) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_URL}/Outpasses/reject/${id}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rejectReason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.title ||
      `Rejection failed (${response.status})`
    );
  }

  return data;
};
export const markExit = async (
  id: number,
  latitude: number,
  longitude: number
) => {
  const response = await fetch(
    `${API_URL}/Outpasses/exit/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    }
  );

  return response.json();
};

export const markReturn = async (
  id: number,
  latitude: number,
  longitude: number
) => {
  const response = await fetch(
    `${API_URL}/Outpasses/return/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),

    }
  );

  return response.json();
};
export async function hasActiveOutpass(studentId: string) {

    const response = await fetch(
        `${API_URL}/Outpasses/active/${studentId}`
    );

    return await response.json();
}
export async function expireOldOutpasses() {
    await fetch(
        `${API_URL}/Outpasses/expire`,
        {
            method: "PUT",
        }
    );
}
export async function cancelOutpass(id: number) {
    const response = await fetch(
        `${API_URL}/Outpasses/cancel/${id}`,
        {
            method: "PUT",
        }
    );

    return await response.json();
}