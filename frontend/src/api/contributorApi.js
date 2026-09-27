import apiClient from "./apiClient";

export const getAllContributors = async () => {
    const response = await apiClient.get("/contributors");
    return response.data;
};

export const createContributor = async (contributor) => {
    const response = await apiClient.post("/contributors", contributor);
    return response.data;
};

export const updateContributor = async (id, contributor) => {
    const response = await apiClient.put(
        `/contributors/${id}`,
        contributor
    );

    return response.data;
};

export const deleteContributor = async (id) => {
    await apiClient.delete(`/contributors/${id}`);
};