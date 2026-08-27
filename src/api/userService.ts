import API_URL from "./api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {})
  };
}


// =====================================================
// USERS
// =====================================================

export async function getUsers() {
  const response = await fetch(
    `${API_URL}/Users`,
    {
      method: "GET",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  return await response.json();
}


// =====================================================
// CREATE USER
// =====================================================

export async function createUser(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Users`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  return await response.json();
}


// =====================================================
// UPDATE USER
// =====================================================

export async function updateUser(
  id: number,
  data: any
) {
  const response = await fetch(
    `${API_URL}/Users/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  return await response.json();
}


// =====================================================
// CHANGE PASSWORD
// =====================================================

export async function changePassword(
  id: number,
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch(
    `${API_URL}/Users/change-password/${id}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  return await response.text();
}


// =====================================================
// DISABLE USER
// =====================================================

export async function disableUser(
  id: number
) {
  const response = await fetch(
    `${API_URL}/Users/disable/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }
}


// =====================================================
// ENABLE USER
// =====================================================

export async function enableUser(
  id: number
) {
  const response = await fetch(
    `${API_URL}/Users/enable/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }
}