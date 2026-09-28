import apiClient, {
    clearCsrfToken,
} from "./apiClient";


export const login =
    async (
        username,
        password
    ) => {

        /*
         * Always start a new authentication
         * flow with a fresh CSRF state.
         */
        clearCsrfToken();


        const response =
            await apiClient.post(
                "/auth/login",
                {
                    username,
                    password,
                }
            );


        return response.data;
    };


export const getCurrentUser =
    async () => {

        const response =
            await apiClient.get(
                "/auth/me"
            );


        return response.data;
    };


export const logout =
    async () => {

        try {

            await apiClient.post(
                "/auth/logout"
            );

        } finally {

            clearCsrfToken();
        }
    };