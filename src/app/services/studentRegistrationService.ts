import API_URL from "../../api/api";

export const getStudentRegistrations = async () => {
    const response = await fetch(
        `${API_URL}/StudentRegistrations/approved`
    );

    if (!response.ok) {
        throw new Error("Failed to load students");
    }

    return await response.json();
};
export const getAllStudentRegistrations = async () => {
    const response = await fetch(
        `${API_URL}/StudentRegistrations`
    );

    if (!response.ok) {
        throw new Error("Failed to load registrations");
    }

    return await response.json();
};