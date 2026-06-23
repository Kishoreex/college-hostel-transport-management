// services/vacatingService.ts

import API_URL from "../../api/api";

export const getAllVacatingRequests =
  async () => {
    const response = await fetch(
      `${API_URL}/Vacating`
    );

    return await response.json();
  };

export const approveVacatingRequest =
  async (id: number) => {
   await fetch(
  `${API_URL}/Vacating/approve/${id}`,
  {
    method: "PUT"
  }
);
  };

export const rejectVacatingRequest =
  async (id: number) => {
    await fetch(
 `${API_URL}/Vacating/reject/${id}`,
      {
        method: "PUT"
      }
    );
  };