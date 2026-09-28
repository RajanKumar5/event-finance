import {
    useState,
} from "react";

import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import "./Login.css";


const Login =
    () => {

        const {
            authenticated,
            loading,
            login,
        } =
            useAuth();


        const navigate =
            useNavigate();


        const location =
            useLocation();


        const [
            username,
            setUsername,
        ] =
            useState("");


        const [
            password,
            setPassword,
        ] =
            useState("");


        const [
            submitting,
            setSubmitting,
        ] =
            useState(false);


        const [
            error,
            setError,
        ] =
            useState("");


        if (
            loading
        ) {

            return (
                <div className="login-page">

                    <div className="login-card">

                        <p>
                            Loading...
                        </p>

                    </div>

                </div>
            );
        }


        if (
            authenticated
        ) {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }


        const handleSubmit =
            async (
                event
            ) => {

                event.preventDefault();


                if (
                    !username.trim()
                ) {

                    setError(
                        "Username is required"
                    );

                    return;
                }


                if (
                    !password
                ) {

                    setError(
                        "Password is required"
                    );

                    return;
                }


                try {

                    setSubmitting(
                        true
                    );

                    setError("");


                    await login(
                        username.trim(),
                        password
                    );


                    const destination =
                        location.state
                            ?.from ||
                        "/dashboard";


                    navigate(
                        destination,
                        {
                            replace:
                                true,
                        }
                    );

                } catch (err) {

                    console.error(
                        err
                    );


                    if (
                        err.response
                            ?.status ===
                        401
                    ) {

                        setError(
                            "Invalid username or password"
                        );

                    } else {

                        setError(
                            err.response
                                ?.data
                                ?.message ||
                            "Unable to sign in. Please try again."
                        );
                    }

                } finally {

                    setSubmitting(
                        false
                    );
                }
            };


        return (

            <div className="login-page">

                <div className="login-card">

                    <div className="login-header">

                        <h1>
                            Event Finance
                        </h1>

                        <p>
                            Sign in to continue
                        </p>

                    </div>


                    {error && (

                        <div className="login-error">

                            {error}

                        </div>
                    )}


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="login-field">

                            <label
                                htmlFor="username"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={
                                    username
                                }
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setUsername(
                                            event.target
                                                .value
                                        )
                                }
                                autoComplete="username"
                                autoFocus
                                disabled={
                                    submitting
                                }
                            />

                        </div>


                        <div className="login-field">

                            <label
                                htmlFor="password"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={
                                    password
                                }
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setPassword(
                                            event.target
                                                .value
                                        )
                                }
                                autoComplete="current-password"
                                disabled={
                                    submitting
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                            disabled={
                                submitting
                            }
                        >

                            {submitting
                                ? "Signing in..."
                                : "Sign In"}

                        </button>

                    </form>

                </div>

            </div>
        );
    };


export default Login;