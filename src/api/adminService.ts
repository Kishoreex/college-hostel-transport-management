const API_URL = "https://college-hostel-transport-management.onrender.com/api";

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