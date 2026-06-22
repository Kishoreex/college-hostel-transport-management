export async function login(
  userId: string,
  password: string,
  module: string
) {
  const response = await fetch(
    "https://esklimo-subtype-snoring.ngrok-free.dev/api/Auth/login",
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