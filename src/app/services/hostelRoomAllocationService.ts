import API_URL from "../../api/api";

export const getAllRoomAllocations = async () => {
  const response = await fetch(
  `${API_URL}/HostelRoomAllocation`
);

  return await response.json();
};