import apiClient from "./apiClient";

export const getAllEvents = async () => {
    const response = await apiClient.get("/events");
    return response.data;
};