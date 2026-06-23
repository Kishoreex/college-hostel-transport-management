import API_URL from "../../api/api";

export const getAvailableStudents =
async (gender: string) => {
  const response = await fetch(
    `${API_URL}/HostelRoomAllocation/available-students/${gender}`
  );

  return await response.json();
};