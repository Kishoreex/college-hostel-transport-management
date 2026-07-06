import API_URL from "../../api/api";

export const getAllRoomAllocations = async () => {
  const response = await fetch(
  `${API_URL}/HostelRoomAllocation`
);

  return await response.json();
};



export const getAvailableStudents = async (
  gender: string
) => {
  const response = await fetch(
    `${API_URL}/HostelRoomAllocation/available-students/${gender}`
  );

  return await response.json();
};
export const changeStudentRoom = async (
  studentId: string,
  roomNumber: string
) => {
  const response = await fetch(
    `${API_URL}/HostelRoomAllocation/change-room`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        roomNumber,
      }),
    }
  );

  return await response.json();
};

export const removeStudentFromRoom = async (
  studentId: string
) => {
  await fetch(
    `${API_URL}/HostelRoomAllocation/student/${studentId}`,
    {
      method: "DELETE",
    }
  );
};