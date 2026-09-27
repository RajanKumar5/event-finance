import {
    NavLink,
    Outlet,
} from "react-router-dom";

import { useEvent } from "../context/EventContext";

const AppLayout = () => {
    const {
        events,
        selectedEventId,
        setSelectedEventId,
        loadingEvents,
    } = useEvent();

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">
                    Event Finance
                </h2>

                <div className="event-selector">
                    <label htmlFor="globalEvent">
                        Current Event
                    </label>

                    {loadingEvents ? (
                        <p>Loading...</p>
                    ) : (
                        <select
                            id="globalEvent"
                            value={selectedEventId}
                            onChange={(event) =>
                                setSelectedEventId(event.target.value)
                            }
                        >
                            {events.map((event) => (
                                <option
                                    key={event.id}
                                    value={event.id}
                                >
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard">
                        Dashboard
                    </NavLink>

                    <NavLink to="/contributors">
                        Contributors
                    </NavLink>

                    <NavLink to="/contributions">
                        Contributions
                    </NavLink>

                    <NavLink to="/expenses">
                        Expenses
                    </NavLink>
                </nav>
            </aside>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;