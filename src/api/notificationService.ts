import API_URL from "./api";

export async function getNotificationCount(
  userId: number
) {
  const response = await fetch(
    `${API_URL}/Notifications/count/${userId}`
  );

  return await response.json();
}

export async function getNotifications(
  userId: number
) {
  const response = await fetch(
    `${API_URL}/Notifications/${userId}`
  );

  return await response.json();
}

export async function markNotificationRead(
  id:number
){
  await fetch(
    `${API_URL}/Notifications/read/${id}`,
    {
      method:"PUT"
    }
  );
}