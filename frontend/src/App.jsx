import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Contributors from "./pages/Contributors";
import Contributions from "./pages/Contributions";

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;