import apiClient from "./apiClient";

export const getEventDashboard = async (
    eventId,
    fromDate = "",
    toDate = ""
) => {
    const params = {};

    if (fromDate) {
        params.fromDate = fromDate;
    }

    if (toDate) {
        params.toDate = toDate;
    }

    const response = await apiClient.get(
        `/events/${eventId}/dashboard`,
        {
            params,
        }
    );

    return response.data;
};
