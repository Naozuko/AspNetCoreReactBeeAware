import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/home/Home';
import Hives from './pages/beekeeping/Hives/Hives';
import Apiaries from './pages/beekeeping/Apiaries/Apiaries';
import Inspections from './pages/beekeeping/Inspections/Inspections';
import Auth from './pages/account/Auth/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Save the attempted URL
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Redirect to home if user is already authenticated
    if (isAuthenticated) {
        return <Navigate to={location.state?.from?.pathname || "/"} replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout>
                        <Home />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/auth" element={
                <AuthenticatedRoute>
                    <Auth />
                </AuthenticatedRoute>
            } />
            <Route path="/beekeeping/hives" element={
                <ProtectedRoute>
                    <Layout>
                        <Hives />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/beekeeping/apiaries" element={
                <ProtectedRoute>
                    <Layout>
                        <Apiaries />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/beekeeping/inspections" element={
                <ProtectedRoute>
                    <Layout>
                        <Inspections />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;