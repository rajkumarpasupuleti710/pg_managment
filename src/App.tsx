import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PgDetails from './components/PgDetails';
import GuestDetails from './components/GuestDetails';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pg/:pgId" element={<PgDetails />} />
          <Route path="/pg/:pgId/guest/:guestId" element={<GuestDetails />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
