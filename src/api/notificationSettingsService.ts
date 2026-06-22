import API_URL from "./api";

export async function getNotificationSettings(
  userId: number
) {
  const response = await fetch(
    `${API_URL}/NotificationSettings/${userId}`
  );

  return await response.json();
}

export async function saveNotificationSettings(
  data: any
) {
  await fetch(
    `${API_URL}/NotificationSettings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
}