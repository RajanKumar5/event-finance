import apiClient from "./apiClient";


/*
 * Expense Categories
 */

export const getExpenseCategories = async (
    activeOnly = false
) => {

    const response =
        await apiClient.get(
            "/master/expense-categories",
            {
                params: {
                    activeOnly,
                },
            }
        );


    return response.data;
};


export const getActiveExpenseCategories =
    async () => {

        return getExpenseCategories(
            true
        );
    };


export const createExpenseCategory =
    async (request) => {

        const response =
            await apiClient.post(
                "/master/expense-categories",
                request
            );


        return response.data;
    };


export const updateExpenseCategory =
    async (
        id,
        request
    ) => {

        const response =
            await apiClient.put(
                `/master/expense-categories/${id}`,
                request
            );


        return response.data;
    };


export const updateExpenseCategoryStatus =
    async (
        id,
        active
    ) => {

        const response =
            await apiClient.patch(
                `/master/expense-categories/${id}/status`,
                null,
                {
                    params: {
                        active,
                    },
                }
            );


        return response.data;
    };


/*
 * Areas
 */

export const getAreas = async (
    activeOnly = false
) => {

    const response =
        await apiClient.get(
            "/master/areas",
            {
                params: {
                    activeOnly,
                },
            }
        );


    return response.data;
};


export const getActiveAreas =
    async () => {

        return getAreas(
            true
        );
    };


export const createArea =
    async (request) => {

        const response =
            await apiClient.post(
                "/master/areas",
                request
            );


        return response.data;
    };


export const updateArea =
    async (
        id,
        request
    ) => {

        const response =
            await apiClient.put(
                `/master/areas/${id}`,
                request
            );


        return response.data;
    };


export const updateAreaStatus =
    async (
        id,
        active
    ) => {

        const response =
            await apiClient.patch(
                `/master/areas/${id}/status`,
                null,
                {
                    params: {
                        active,
                    },
                }
            );


        return response.data;
    };