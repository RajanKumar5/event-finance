import apiClient from "./apiClient";

export const getAllEvents = async () => {
    const response = await apiClient.get("/events");

    return response.data;
};

export const createEvent = async (event) => {
    const response = await apiClient.post(
        "/events",
        event
    );

    return response.data;
};

export const updateEvent = async (id, event) => {
    const response = await apiClient.put(
        `/events/${id}`,
        event
    );

    return response.data;
};

export const deleteEvent = async (id) => {
    await apiClient.delete(`/events/${id}`);
};