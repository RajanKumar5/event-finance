import { NavLink, Outlet } from "react-router-dom";
import { useEvent } from "../context/EventContext";

const AppLayout = () => {
    const {
        events,
        selectedEventId,
        setSelectedEventId,
        loadingEvents,
    } = useEvent();

    const renderEventSelector = (id) => {
        if (loadingEvents) {
            return <p>Loading events...</p>;
        }

        if (events.length === 0) {
            return <p>No events available</p>;
        }

        return (
            <select
                id={id}
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
        );
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">
                    Event Finance
                </h2>

                <div className="event-selector desktop-event-selector">
                    <label htmlFor="desktopEvent">
                        Current Event
                    </label>

                    {renderEventSelector("desktopEvent")}
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/events">
                        Events
                    </NavLink>
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
                <div className="mobile-event-selector">
                    <label htmlFor="mobileEvent">
                        Current Event
                    </label>

                    {renderEventSelector("mobileEvent")}
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;