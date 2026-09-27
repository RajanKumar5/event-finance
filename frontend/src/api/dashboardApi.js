import apiClient from "./apiClient";

export const getEventDashboard = async (eventId) => {
    const response = await apiClient.get(
        `/events/${eventId}/dashboard`
    );

    return response.data;
};