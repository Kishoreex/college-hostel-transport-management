const API_URL = "http://localhost:10000";

export async function getRegistrations() {
  const response = await fetch(
    `${API_URL}/StudentRegistrations`
  );

  return await response.json();
}

export async function approveStudent(id: number) {
  const response = await fetch(
    `${API_URL}/StudentRegistrations/approve/${id}`,
    {
      method: "POST"
    }
  );

  return await response.json();
}