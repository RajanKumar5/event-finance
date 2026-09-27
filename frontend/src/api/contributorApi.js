import apiClient from "./apiClient";

export const getAllContributors = async () => {
    const response = await apiClient.get("/contributors");
    return response.data;
};

export const createContributor = async (contributor) => {
    const response = await apiClient.post("/contributors", contributor);
    return response.data;
};