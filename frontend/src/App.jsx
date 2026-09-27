import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Contributors from "./pages/Contributors";
import Contributions from "./pages/Contributions";
import Expenses from "./pages/Expenses";
import Events from "./pages/Events";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/contributors"
          element={<Contributors />}
        />

        <Route
          path="/contributions"
          element={<Contributions />}
        />

        <Route
          path="/expenses"
          element={<Expenses />}
        />

        <Route
          path="/events"
          element={<Events />}
        />
      </Route>
    </Routes>
  );
}

export default App;