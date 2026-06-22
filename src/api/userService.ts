import API_URL from "./api";

export async function getUsers() {
  const response = await fetch(`${API_URL}/Users`);

  return await response.json();
}

export async function createUser(data: any) {
  const response = await fetch(`${API_URL}/Users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await response.json();
}

export async function updateUser(
  id: number,
  data: any
) {
  const response = await fetch(
    `${API_URL}/Users/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  return await response.json();
}

export async function changePassword(
  id: number,
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch(
    `${API_URL}/Users/change-password/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    }
  );

  return await response.text();
}

export async function disableUser(id:number) {
  await fetch(
    `${API_URL}/Users/disable/${id}`,
    {
      method:"PUT"
    }
  );
}

export async function enableUser(id:number) {
  await fetch(
    `${API_URL}/Users/enable/${id}`,
    {
      method:"PUT"
    }
  );
}

