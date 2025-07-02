import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface PG {
  id: number;
  pg_name: string;
  user_id: number;
}

interface RoomDetails {
  pg_id: number;
  room_id: number;
  room_share: number;
  room_price: number;
}

interface PgDetails {
  pg_details: {
    id: number;
    pg_name: string;
  };
  room_details: Array<{
    id: number;
    room_id: number;
    room_share: number;
    room_price: number;
    vacancies: number;
  }>;
}

const BACKEND_URL = 'http://localhost:8000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [pgName, setPgName] = useState('');
  const [selectedPg, setSelectedPg] = useState<PG | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    pg_id: 0,
    room_id: 0,
    room_share: 1,
    room_price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPgDetails, setShowPgDetails] = useState(false);
  const [pgDetailsData, setPgDetailsData] = useState<PgDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch PGs on component mount
  useEffect(() => {
    const fetchPGs = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${BACKEND_URL}/dashboard`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        if (data.status === 'success') {
          setPgs(data.pgs);
        }
      } catch (err) {
        console.error('Error fetching PGs:', err);
        setError('Failed to fetch PGs');
      }
    };
    fetchPGs();
  }, [navigate]);

  const handlePgClick = (pg: PG) => {
    setSelectedPg(pg);
    setRoomDetails(prev => ({ ...prev, pg_id: pg.id }));
    setShowRoomForm(true);
  };

  const handleAddRoom = async (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/add_room_details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(roomDetails),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Show success message for both cases
        setSuccessMessage('Room added successfully!');
        
        if (addAnother) {
          // Reset only the room-specific fields, keep the pg_id
          setRoomDetails(prev => ({
            ...prev,
            room_id: 0,
            room_share: 1,
            room_price: 0
          }));
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          // For Save & Close, show message briefly before closing
          setTimeout(() => {
            setShowRoomForm(false);
            setRoomDetails({
              pg_id: selectedPg?.id || 0,
              room_id: 0,
              room_share: 1,
              room_price: 0
            });
            setSuccessMessage('');
          }, 1000); // Show message for 1 second before closing
        }
      } else {
        setError(data.message || 'Failed to add room');
      }
    } catch (err) {
      console.error('Error adding room:', err);
      setError('Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  // Existing createPg function remains the same
  const createPg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/create_pgs?pg_name=${encodeURIComponent(pgName)}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPgs([...pgs, data.pgs]);
        setShowForm(false);
        setPgName('');
      } else {
        setError(data.message || 'Failed to create PG');
      }
    } catch (err) {
      console.error('Error creating PG:', err);
      setError('Failed to create PG');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPgDetails = (pgId: number) => {
    navigate(`/pg/${pgId}`);
  };

  const handleAddRoomsClick = (pg: PG) => {
    setSelectedPg(pg);
    setShowRoomForm(true);
  };

  return (
    <div className="dashboard-layout">
      <nav className="tab-navbar">
        <ul className="tab-navbar-list">
          <li className="tab-list-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </li>
          <li className="tab-list-item">
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </li>
          <li className="tab-list-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </li>
          <li className="tab-list-item">
            <span className="nav-icon">🛄</span>
            <span className="nav-text">Bag</span>
          </li>
        </ul>
      </nav>

      <h1 className="dashboard-title">Your PGs</h1>
      <div className="pg-cards-row">
        {pgs.map((pg) => (
          <div className="pg-card" key={pg.id}>
            <span className="pg-card-name">{pg.pg_name}</span>
            <div className="pg-card-actions">
              <button 
                onClick={() => handleAddRoomsClick(pg)}
                className="action-btn add-rooms-btn"
              >
                Add Rooms
              </button>
              <button 
                onClick={() => handleViewPgDetails(pg.id)}
                className="action-btn view-details-btn"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        <div className="create-pg-card">
          <div className="create-pg-inner">
            <button className="plus-btn" title="Add New PG" onClick={() => setShowForm(true)}>
              <span className="plus-icon">+</span>
            </button>
          </div>
          <span className="add-text">Add New</span>
        </div>
      </div>

      {/* Add PG Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New PG</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={createPg}>
              <div className="form-group">
                <label>PG Name:</label>
                <input
                  type="text"
                  value={pgName}
                  onChange={(e) => setPgName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add PG'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Details Modal */}
      {showRoomForm && selectedPg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Room Details for {selectedPg.pg_name}</h2>
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            <form onSubmit={(e) => handleAddRoom(e, false)}>
              <div className="form-group">
                <label>Room Number:</label>
                <input
                  type="number"
                  value={roomDetails.room_id}
                  onChange={(e) => setRoomDetails(prev => ({ ...prev, room_id: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Share (1-4):</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={roomDetails.room_share}
                  onChange={(e) => setRoomDetails(prev => ({ ...prev, room_share: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={roomDetails.room_price}
                  onChange={(e) => setRoomDetails(prev => ({ ...prev, room_price: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="button-group">
                <button type="button" onClick={() => setShowRoomForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={(e) => handleAddRoom(e, true)} 
                  className="save-add-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save & Add Next'}
                </button>
                <button 
                  type="submit" 
                  className="save-close-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save & Close'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 