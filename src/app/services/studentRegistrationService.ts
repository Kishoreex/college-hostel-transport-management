import API_URL from "../../api/api";
export const getStudentRegistrations = async () => {
    const response = await fetch(
        `${API_URL}/StudentRegistrations/approved`
    );

    return response.json();
};