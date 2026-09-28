import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
} from "../api/authApi";


const AuthContext =
    createContext(null);


export const AuthProvider = ({
    children,
}) => {

    const [
        user,
        setUser,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    useEffect(
        () => {

            const restoreSession =
                async () => {

                    try {

                        const currentUser =
                            await getCurrentUser();


                        setUser(
                            currentUser
                        );

                    } catch (err) {

                        /*
                         * 401 simply means there is
                         * no logged-in session.
                         */
                        if (
                            err.response
                                ?.status !==
                            401
                        ) {

                            console.error(
                                "Failed to restore authentication session",
                                err
                            );
                        }


                        setUser(
                            null
                        );

                    } finally {

                        setLoading(
                            false
                        );
                    }
                };


            restoreSession();

        },
        []
    );


    const login =
        async (
            username,
            password
        ) => {

            const authenticatedUser =
                await loginRequest(
                    username,
                    password
                );


            setUser(
                authenticatedUser
            );


            return authenticatedUser;
        };


    const logout =
        async () => {

            try {

                await logoutRequest();

            } finally {

                setUser(
                    null
                );
            }
        };


    const isAdmin =
        user?.role ===
        "ADMIN";


    const isEditor =
        user?.role ===
        "EDITOR";


    const isViewer =
        user?.role ===
        "VIEWER";


    const canEdit =
        isAdmin ||
        isEditor;


    return (

        <AuthContext.Provider
            value={{
                user,

                loading,

                authenticated:
                    Boolean(
                        user
                    ),

                isAdmin,

                isEditor,

                isViewer,

                canEdit,

                login,

                logout,
            }}
        >

            {children}

        </AuthContext.Provider>
    );
};


export const useAuth =
    () => {

        const context =
            useContext(
                AuthContext
            );


        if (
            !context
        ) {

            throw new Error(
                "useAuth must be used inside AuthProvider"
            );
        }


        return context;
    };