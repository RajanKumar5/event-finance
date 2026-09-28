import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import Contributors from "./pages/Contributors";
import Contributions from "./pages/Contributions";
import ContributorStatus from "./pages/ContributorStatus";
import ContributorHistory from "./pages/ContributorHistory";
import Expenses from "./pages/Expenses";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./pages/Login";


function App() {

  return (

    <AuthProvider>

      <Routes>

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          element={
            <ProtectedRoute />
          }
        >

          <Route
            element={
              <AppLayout />
            }
          >

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
              element={
                <Dashboard />
              }
            />


            <Route
              path="/contributors"
              element={
                <Contributors />
              }
            />


            <Route
              path="/contributions"
              element={
                <Contributions />
              }
            />


            <Route
              path="/contributor-status"
              element={
                <ContributorStatus />
              }
            />


            <Route
              path="/contributor-history"
              element={
                <ContributorHistory />
              }
            />


            <Route
              path="/expenses"
              element={
                <Expenses />
              }
            />


            <Route
              path="/events"
              element={
                <Events />
              }
            />


            <Route
              path="/reports"
              element={
                <Reports />
              }
            />


            {/* ADMIN-only frontend routes */}
            <Route
              element={
                <AdminRoute />
              }
            >

              <Route
                path="/settings"
                element={
                  <Settings />
                }
              />


              <Route
                path="/users"
                element={
                  <Users />
                }
              />

            </Route>

          </Route>

        </Route>


        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </AuthProvider>
  );
}


export default App;