import API_URL from "./api";

export async function getDashboardSummary() {
    const response = await fetch(
        `${API_URL}/AdminDashboard/summary`
    );

    if (!response.ok) {
        throw new Error("Failed to load dashboard.");
    }

    return await response.json();
}
export async function getActivities() {
    const response = await fetch(
        `${API_URL}/AdminDashboard/activities`
    );

    if (!response.ok) {
        throw new Error("Failed to load activities.");
    }

    return await response.json();
}