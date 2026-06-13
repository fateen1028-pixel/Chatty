import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Backup from './pages/Backup.jsx';
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

const PublicRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

function App() {
  return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
            />

            <Route
                path="/backup"
                element={
                  <ProtectedRoute>
                    <Backup />
                  </ProtectedRoute>
                }
            />

              <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
              />

              <Route
                  path="/reset-password"
                  element={<ResetPassword />}
              />


          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;