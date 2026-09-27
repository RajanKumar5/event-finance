import apiClient from "./apiClient";

export const getAllContributions = async () => {
    const response = await apiClient.get("/contributions");
    return response.data;
};

export const getContributionsByEvent = async (eventId) => {
    const response = await apiClient.get(
        `/contributions/event/${eventId}`
    );

    return response.data;
};

export const createContribution = async (contribution) => {
    const response = await apiClient.post(
        "/contributions",
        contribution
    );

    return response.data;
};

export const updateContribution = async (
    id,
    contribution
) => {
    const response = await apiClient.put(
        `/contributions/${id}`,
        contribution
    );

    return response.data;
};

export const deleteContribution = async (id) => {
    await apiClient.delete(
        `/contributions/${id}`
    );
};

export const searchContributorsByName = async (name) => {
    const response = await apiClient.get(
        "/contributors/search",
        {
            params: { name },
        }
    );

    return response.data;
};

export const getContributorsByArea = async (area) => {
    const response = await apiClient.get(
        `/contributors/area/${area}`
    );

    return response.data;
};

export const getContributorByHouseNumber = async (
    houseNumber
) => {
    const response = await apiClient.get(
        `/contributors/house/${houseNumber}`
    );

    return response.data;
};