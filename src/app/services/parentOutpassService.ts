import API_URL from "../../api/api";

export async function getParentOutpasses(parentId: string) {
    const response = await fetch(
        `${API_URL}/Outpasses/parent/${parentId}`
    );

    if (!response.ok)
        throw new Error("Failed");

    return await response.json();
}