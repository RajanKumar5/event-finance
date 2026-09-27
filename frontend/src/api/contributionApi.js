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