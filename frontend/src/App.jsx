import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Contributors from "./pages/Contributors";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/contributors"
        element={<Contributors />}
      />
    </Routes>
  );
}

export default App;