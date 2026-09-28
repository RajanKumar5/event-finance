import {
    useEffect,
    useState,
} from "react";

import {
    createUser,
    getUsers,
    resetUserPassword,
    updateUser,
} from "../api/userApi";

import {
    useAuth,
} from "../context/AuthContext";


const createEmptyForm =
    () => ({
        username: "",
        displayName: "",
        password: "",
        role: "VIEWER",
    });


const Users =
    () => {

        const {
            user: currentUser,
        } =
            useAuth();


        const [
            users,
            setUsers,
        ] =
            useState([]);


        const [
            form,
            setForm,
        ] =
            useState(
                createEmptyForm()
            );


        const [
            loading,
            setLoading,
        ] =
            useState(false);


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


        const [
            successMessage,
            setSuccessMessage,
        ] =
            useState("");


        const [
            editingId,
            setEditingId,
        ] =
            useState(null);


        const [
            resetPasswordId,
            setResetPasswordId,
        ] =
            useState(null);


        const [
            newPassword,
            setNewPassword,
        ] =
            useState("");


        const loadUsers =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const data =
                        await getUsers();


                    setUsers(
                        data
                    );

                } catch (err) {

                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load users"
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            };


        useEffect(
            () => {

                loadUsers();

            },
            []
        );


        const handleChange =
            (event) => {

                const {
                    name,
                    value,
                } =
                    event.target;


                setForm(
                    previous => ({
                        ...previous,
                        [name]:
                            value,
                    })
                );
            };


        const clearMessages =
            () => {

                setError("");

                setSuccessMessage("");
            };


        const resetForm =
            () => {

                setEditingId(
                    null
                );

                setForm(
                    createEmptyForm()
                );
            };


        const handleSubmit =
            async (
                event
            ) => {

                event.preventDefault();


                clearMessages();


                try {

                    setSubmitting(
                        true
                    );


                    if (
                        editingId !==
                        null
                    ) {

                        const existingUser =
                            users.find(
                                item =>
                                    item.id ===
                                    editingId
                            );


                        await updateUser(
                            editingId,
                            {
                                displayName:
                                    form.displayName
                                        .trim(),

                                role:
                                    form.role,

                                enabled:
                                    existingUser
                                        ?.enabled !==
                                    false,
                            }
                        );


                        setSuccessMessage(
                            "User updated successfully"
                        );

                    } else {

                        await createUser({
                            username:
                                form.username
                                    .trim(),

                            displayName:
                                form.displayName
                                    .trim(),

                            password:
                                form.password,

                            role:
                                form.role,
                        });


                        setSuccessMessage(
                            "User created successfully"
                        );
                    }


                    resetForm();

                    await loadUsers();

                } catch (err) {

                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to save user"
                    );

                } finally {

                    setSubmitting(
                        false
                    );
                }
            };


        const handleEdit =
            (user) => {

                clearMessages();


                setEditingId(
                    user.id
                );


                setForm({
                    username:
                        user.username,

                    displayName:
                        user.displayName,

                    password: "",

                    role:
                        user.role,
                });


                window.scrollTo({
                    top: 0,
                    behavior:
                        "smooth",
                });
            };


        const handleToggleEnabled =
            async (
                user
            ) => {

                clearMessages();


                if (
                    user.id ===
                    currentUser?.id &&
                    user.enabled
                ) {

                    setError(
                        "You cannot disable your own account"
                    );

                    return;
                }


                try {

                    await updateUser(
                        user.id,
                        {
                            displayName:
                                user.displayName,

                            role:
                                user.role,

                            enabled:
                                !user.enabled,
                        }
                    );


                    setSuccessMessage(
                        user.enabled
                            ? "User disabled successfully"
                            : "User enabled successfully"
                    );


                    await loadUsers();

                } catch (err) {

                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to update user status"
                    );
                }
            };


        const openPasswordReset =
            (user) => {

                clearMessages();

                setResetPasswordId(
                    user.id
                );

                setNewPassword("");
            };


        const cancelPasswordReset =
            () => {

                setResetPasswordId(
                    null
                );

                setNewPassword("");
            };


        const handlePasswordReset =
            async (
                userId
            ) => {

                clearMessages();


                if (
                    newPassword.length <
                    8
                ) {

                    setError(
                        "Password must be at least 8 characters"
                    );

                    return;
                }


                try {

                    await resetUserPassword(
                        userId,
                        newPassword
                    );


                    setSuccessMessage(
                        "Password reset successfully"
                    );


                    cancelPasswordReset();

                } catch (err) {

                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to reset password"
                    );
                }
            };


        return (

            <div className="page-container">

                <div className="page-header">

                    <div>

                        <h1>
                            User Management
                        </h1>

                        <p>
                            Manage application users and permissions
                        </p>

                    </div>

                </div>


                {error && (

                    <div className="error-message">

                        {error}

                    </div>
                )}


                {successMessage && (

                    <div className="success-message">

                        {successMessage}

                    </div>
                )}


                <form
                    className="form-card"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <h2>
                        {editingId !== null
                            ? "Edit User"
                            : "Add User"}
                    </h2>


                    <div className="form-grid">

                        <div className="form-field">

                            <label>
                                Username
                            </label>

                            <input
                                name="username"
                                value={
                                    form.username
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    editingId !==
                                    null
                                }
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Display Name
                            </label>

                            <input
                                name="displayName"
                                value={
                                    form.displayName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        {editingId ===
                            null && (

                                <div className="form-field">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        minLength={
                                            8
                                        }
                                        required
                                    />

                                </div>
                            )}


                        <div className="form-field">

                            <label>
                                Role
                            </label>

                            <select
                                name="role"
                                value={
                                    form.role
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    editingId !==
                                    null &&
                                    users.find(
                                        item =>
                                            item.id ===
                                            editingId
                                    )?.id ===
                                    currentUser?.id
                                }
                            >

                                <option value="ADMIN">
                                    Admin
                                </option>

                                <option value="EDITOR">
                                    Editor
                                </option>

                                <option value="VIEWER">
                                    Viewer
                                </option>

                            </select>

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={
                                submitting
                            }
                        >

                            {submitting
                                ? "Saving..."
                                : editingId !==
                                    null
                                    ? "Update User"
                                    : "Create User"}

                        </button>


                        {editingId !==
                            null && (

                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={
                                        resetForm
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                    </div>

                </form>


                <div className="table-card">

                    <h2>
                        Users
                    </h2>


                    {loading ? (

                        <p>
                            Loading users...
                        </p>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Username
                                        </th>

                                        <th>
                                            Name
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(
                                        user => (

                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >

                                                <td>

                                                    {user.username}

                                                    {user.id ===
                                                        currentUser?.id && (
                                                            <>
                                                                {" "}
                                                                <strong>
                                                                    (You)
                                                                </strong>
                                                            </>
                                                        )}

                                                </td>


                                                <td>
                                                    {user.displayName}
                                                </td>


                                                <td>

                                                    <span
                                                        className="status-badge"
                                                    >
                                                        {user.role}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            user.enabled
                                                                ? "status-badge status-completed"
                                                                : "status-badge status-cancelled"
                                                        }
                                                    >
                                                        {user.enabled
                                                            ? "Active"
                                                            : "Disabled"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={
                                                                () =>
                                                                    handleEdit(
                                                                        user
                                                                    )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={
                                                                () =>
                                                                    openPasswordReset(
                                                                        user
                                                                    )
                                                            }
                                                        >
                                                            Reset Password
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                user.enabled
                                                                    ? "danger-button"
                                                                    : "secondary-button"
                                                            }
                                                            disabled={
                                                                user.id ===
                                                                currentUser?.id &&
                                                                user.enabled
                                                            }
                                                            onClick={
                                                                () =>
                                                                    handleToggleEnabled(
                                                                        user
                                                                    )
                                                            }
                                                        >
                                                            {user.enabled
                                                                ? "Disable"
                                                                : "Enable"}
                                                        </button>

                                                    </div>


                                                    {resetPasswordId ===
                                                        user.id && (

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "10px",
                                                                }}
                                                            >

                                                                <input
                                                                    type="password"
                                                                    value={
                                                                        newPassword
                                                                    }
                                                                    onChange={
                                                                        event =>
                                                                            setNewPassword(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                    }
                                                                    placeholder="New password"
                                                                    minLength={
                                                                        8
                                                                    }
                                                                />


                                                                <div
                                                                    className="table-actions"
                                                                    style={{
                                                                        marginTop:
                                                                            "8px",
                                                                    }}
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        className="primary-button"
                                                                        onClick={
                                                                            () =>
                                                                                handlePasswordReset(
                                                                                    user.id
                                                                                )
                                                                        }
                                                                    >
                                                                        Save Password
                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        className="secondary-button"
                                                                        onClick={
                                                                            cancelPasswordReset
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                </div>

                                                            </div>
                                                        )}

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>
        );
    };


export default Users;