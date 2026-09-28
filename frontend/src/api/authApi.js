import apiClient, {
    clearCsrfToken,
    loadCsrfToken,
} from "./apiClient";


export const login =
    async (
        username,
        password
    ) => {

        clearCsrfToken();


        const response =
            await apiClient.post(
                "/auth/login",
                {
                    username,
                    password,
                }
            );


        /*
         * Login creates the authenticated
         * HTTP session.
         *
         * Get the CSRF token associated with
         * that authenticated session.
         */
        await loadCsrfToken();


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