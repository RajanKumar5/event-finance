import { NavLink, Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2>Event Finance</h2>

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