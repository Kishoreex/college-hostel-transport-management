import API_URL from "./api";

export const registerStudent = async (
  data: any
) => {
  const response = await fetch(
    `${API_URL}/StudentRegistrations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  return await response.json();
};

export async function submitTransportRegistration(data: any) {
  const response = await fetch(
    `${API_URL}/TransportRegistrations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  return await response.json();
}