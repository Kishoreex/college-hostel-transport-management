const API_URL = "http://192.168.0.167:5077/api/outpasses";

export const createOutpass = async (data: any) => {
  const response = await fetch(API_URL, {
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
    `${API_URL}/${studentId}`
  );

  return response.json();
};



export const getAllOutpasses = async () => {
  const response = await fetch(
    "http://192.168.0.167:5077/api/outpasses"
  );

  if (!response.ok) {
    throw new Error("Failed to load outpasses");
  }

  return response.json();
};

export const approveOutpass = async (
  id: number
) => {
  const response = await fetch(
    `http://192.168.0.167:5077/api/outpasses/approve/${id}`,
    {
      method: "PUT",
    }
  );

  return response.json();
};

export const rejectOutpass = async (
  id: number
) => {
  const response = await fetch(
    `http://192.168.0.167:5077/api/outpasses/reject/${id}`,
    {
      method: "PUT",
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
    `${API_URL}/exit/${id}`,
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
    `${API_URL}/return/${id}`,
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