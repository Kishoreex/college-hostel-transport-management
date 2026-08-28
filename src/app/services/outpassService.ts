
export async function getOutpasses(
  college?: string | null
) {
  const url = college
    ? `${API_URL}/Outpasses?college=${encodeURIComponent(college)}`
    : `${API_URL}/Outpasses`;

  const response = await fetch(url);

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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load outpasses");
  }

  return response.json();
};
export const approveOutpass = async (
  id: number
) => {
  const response = await fetch(
`${API_URL}/Outpasses/approve/${id}`,
    {
      method: "PUT",
    }
  );

  return response.json();
};

export const rejectOutpass = async (
  id: number,
  rejectReason: string
) => {
  const response = await fetch(
    `${API_URL}/Outpasses/reject/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rejectReason,
      }),
    }
  );

  return response.json();
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