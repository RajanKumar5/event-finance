import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Contributors from "./pages/Contributors";
import Contributions from "./pages/Contributions";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" />}
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
      </Route>
    </Routes>
  );
}

export default App;