import {
    Navigate,
    Outlet,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


const AdminRoute =
    () => {

        const {
            isAdmin,
            loading,
        } =
            useAuth();


        if (
            loading
        ) {

            return (
                <div
                    style={{
                        padding: "32px",
                    }}
                >
                    Loading...
                </div>
            );
        }


        if (
            !isAdmin
        ) {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }


        return (
            <Outlet />
        );
    };


export default AdminRoute;