import { getDeviceId } from "../utils/device";

export async function login(
  userId: string,
  password: string,
  module: string
) {
const response = await fetch(
  "https://202.61.121.102:8443/api/Auth/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
 body: JSON.stringify({
  userId,
  password,
  module,
  deviceId: getDeviceId()
})
  }
);

if (!response.ok) {

    const message =
        await response.text();

    throw new Error(message);
}

  return await response.json();
}
export async function logout(userId: string) {
  const response = await fetch(
    `https://202.61.121.102:8443/api/Auth/logout/${userId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok)
    throw new Error("Logout failed");
}
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch(
    "https://202.61.121.102:8443/api/Auth/change-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        currentPassword,
        newPassword
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.text();
}