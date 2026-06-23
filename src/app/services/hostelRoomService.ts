import API_URL from "../../api/api";

export const getAllRooms = async () => {
  const response = await fetch(
    `${API_URL}/HostelRooms`
  );

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

  return await response.json();
};

export const deleteRoom = async (id: number) => {
  await fetch(
    `${API_URL}/HostelRooms/${id}`,
    {
      method: "DELETE",
    }
  );
};