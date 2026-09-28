import axios from "axios";


const API_BASE_URL =
    "http://localhost:8080/api/v1";


const apiClient =
    axios.create({
        baseURL:
            API_BASE_URL,

        /*
         * Required so the browser sends
         * JSESSIONID with API requests.
         */
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


const loadCsrfToken =
    async () => {

        if (
            csrfToken
        ) {

            return;
        }


        const response =
            await axios.get(
                `${API_BASE_URL}/auth/csrf`,
                {
                    withCredentials:
                        true,
                }
            );


        csrfToken =
            response.data.token;

        csrfHeaderName =
            response.data.headerName ||
            "X-XSRF-TOKEN";
    };


apiClient.interceptors.request.use(
    async (config) => {

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


        /*
         * Backend intentionally permits login
         * without a CSRF token because the user
         * does not yet have a session.
         */
        const isLoginRequest =
            config.url
                ?.includes(
                    "/auth/login"
                );


        if (
            requiresCsrf &&
            !isLoginRequest
        ) {

            await loadCsrfToken();


            if (
                config.headers
                    ?.set
            ) {

                config.headers.set(
                    csrfHeaderName,
                    csrfToken
                );

            } else {

                config.headers = {
                    ...config.headers,

                    [csrfHeaderName]:
                        csrfToken,
                };
            }
        }


        return config;
    }
);


export default apiClient;