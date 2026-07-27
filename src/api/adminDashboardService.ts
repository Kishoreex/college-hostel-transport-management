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
export async function getHostelStudents(college: string) {
    const res = await fetch(
        `${API_URL}/AdminDashboard/hostelStudents?college=${encodeURIComponent(college)}`
    );

    return await res.json();
}

export async function getTransportStudents(college: string) {
    const res = await fetch(
        `${API_URL}/AdminDashboard/transportStudents?college=${encodeURIComponent(college)}`
    );

    return await res.json();
}