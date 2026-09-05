import API_URL from "../../api/api";

export const getAllRooms = async (
  college?: string | null
) => {
  const url = college
    ? `${API_URL}/HostelRooms?college=${encodeURIComponent(college)}`
    : `${API_URL}/HostelRooms`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load rooms");
  }

  return await response.json();
};


export const createRoom = async (room: any) => {
  const response = await fetch(
    `${API_URL}/HostelRooms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create room");
  }

  return await response.json();
};


export const deleteRoom = async (id: number) => {
  const response = await fetch(
    `${API_URL}/HostelRooms/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }
};


export const updateRoom = async (
  roomNumber: string,
  room: any
) => {
  const response = await fetch(
    `${API_URL}/HostelRooms/${roomNumber}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update room");
  }

  return await response.json();
};