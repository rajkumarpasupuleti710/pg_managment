import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './i18n/config';  // Import i18n configuration
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PgDetails from './components/PgDetails';
import GuestDetails from './components/GuestDetails';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/pg/:pgId" element={
            <ProtectedRoute>
              <PgDetails />
            </ProtectedRoute>
          } />
          <Route path="/pg/:pgId/guest/:guestId" element={
            <ProtectedRoute>
              <GuestDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
