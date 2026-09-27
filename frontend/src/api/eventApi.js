import apiClient from "./apiClient";

export const getAllEvents = async () => {
    const response = await apiClient.get("/events");
    return response.data;
};

export const getExpensesByEvent = async (eventId) => {
    const response = await apiClient.get(
        `/expenses/event/${eventId}`
    );

    return response.data;
};

export const createExpense = async (expense) => {
    const response = await apiClient.post(
        "/expenses",
        expense
    );

    return response.data;
};

export const updateExpense = async (id, expense) => {
    const response = await apiClient.put(
        `/expenses/${id}`,
        expense
    );

    return response.data;
};

export const deleteExpense = async (id) => {
    await apiClient.delete(`/expenses/${id}`);
};