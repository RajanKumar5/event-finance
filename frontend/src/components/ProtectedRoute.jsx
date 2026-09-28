import {
    Navigate,
    Outlet,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


const ProtectedRoute =
    () => {

        const {
            authenticated,
            loading,
        } =
            useAuth();


        if (
            loading
        ) {

            return (
                <div
                    style={{
                        padding:
                            "32px",
                    }}
                >
                    Loading...
                </div>
            );
        }


        if (
            !authenticated
        ) {

            return (
                <Navigate
                    to="/login"
                    replace
                />
            );
        }


        return (
            <Outlet />
        );
    };


export default ProtectedRoute;