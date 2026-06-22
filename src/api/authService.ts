export async function login(
  userId: string,
  password: string,
  module: string
) {
  const response = await fetch(
    "http://192.168.0.167:5077/api/Auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        password,
        module
      })
    }
  );

  if (!response.ok) {
    throw new Error("Login Failed");
  }

  return await response.json();
}