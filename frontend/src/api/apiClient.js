import axios from "axios";


const API_BASE_URL =
    "/api/v1";


const apiClient =
    axios.create({
        baseURL:
            API_BASE_URL,

        withCredentials:
            true,
    });


let csrfToken =
    null;

let csrfHeaderName =
    "X-XSRF-TOKEN";


export const clearCsrfToken =
    () => {

        csrfToken =
            null;

        csrfHeaderName =
            "X-XSRF-TOKEN";
    };


export const loadCsrfToken =
    async () => {

        const response =
            await axios.get(
                `${API_BASE_URL}/auth/csrf`,
                {
                    withCredentials:
                        true,

                    headers: {
                        "Cache-Control":
                            "no-cache",
                    },
                }
            );


        if (
            !response.data ||
            !response.data.token
        ) {

            throw new Error(
                "CSRF token was not returned by backend"
            );
        }


        csrfToken =
            response.data.token;


        csrfHeaderName =
            response.data.headerName ||
            "X-XSRF-TOKEN";


        return csrfToken;
    };


apiClient.interceptors.request.use(
    async (
        config
    ) => {

        const method =
            (
                config.method ||
                "get"
            )
                .toLowerCase();


        const requiresCsrf =
            [
                "post",
                "put",
                "patch",
                "delete",
            ].includes(
                method
            );


        const isLoginRequest =
            config.url
                ?.includes(
                    "/auth/login"
                );


        if (
            requiresCsrf &&
            !isLoginRequest
        ) {

            /*
             * Get a fresh CSRF token before
             * every modifying request.
             */
            await loadCsrfToken();


            config.headers =
                config.headers ||
                {};


            if (
                typeof config.headers.set ===
                "function"
            ) {

                config.headers.set(
                    csrfHeaderName,
                    csrfToken
                );

            } else {

                config.headers[
                    csrfHeaderName
                ] =
                    csrfToken;
            }
        }


        return config;
    }
);


export default apiClient;