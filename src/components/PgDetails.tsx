import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PgDetails.css';

interface RoomDetail {
  id: number;
  room_id: number;
  room_share: number;
  room_price: number;
  vacancies: number;
}

interface GuestDetail {
  id: number;
  name: string;
  age: number;
  phone: string;
  aadhar_no: string;
  room_id: number;
  date_of_join: string;
  due: number;
  pay_date: string;
}

interface PgDetailsData {
  pg_details: {
    id: number;
    pg_name: string;
  };
  room_details: RoomDetail[];
}

interface RoomDetails {
  pg_id: number;
  room_id: number;
  room_share: number;
  room_price: number;
}

interface GuestDetails {
  name: string;
  age: number;
  phone: string;
  aadhar_no: string;
  room_id: number;
  pg_id: number;
  date_of_join: string;
}

// Update the BillDetail interface
interface BillDetail {
  bill_id: number;
  guest_id: number;
  guest_name: string;
  room_id: number;
  amount: number;
  months: string;
  paid: boolean;
  pg_id: number;
}


interface BillsResponse {
  status: string;
  message?: string;
  paid_bills: BillDetail[];
  unpaid_bills: BillDetail[];
  total_paid: number;
  total_unpaid: number;
  new_bills_generated: number;
}

// Add this new interface for the all_bills response
interface AllBillsResponse {
  status: string;
  message?: string;
  total_bills: number;
  bills: BillDetail[];
  total_amount: number;
  total_paid: number;
  total_unpaid: number;
}


const BACKEND_URL = 'http://localhost:8000';

const PgDetails = () => {
  const { pgId } = useParams();
  const navigate = useNavigate();
  const [pgDetailsData, setPgDetailsData] = useState<PgDetailsData | null>(null);
  const [guests, setGuests] = useState<GuestDetail[]>([]);
  const [paidBills, setPaidBills] = useState<BillDetail[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<BillDetail[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'rooms' | 'guests' | 'bills'>('rooms');
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    pg_id: Number(pgId),
    room_id: 0,
    room_share: 1,
    room_price: 0
  });
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    age: 18,
    phone: '',
    aadhar_no: '',
    room_id: 0,
    pg_id: Number(pgId),
    date_of_join: new Date().toISOString().split('T')[0]
  });

  const handleAddRoom = async (e: React.FormEvent, addAnother: boolean) => {
    e.preventDefault();
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
        setSuccessMessage('Room added successfully!');
        
        // Refresh PG details
        fetchPgDetails();
        
        if (addAnother) {
          // Reset form for next room
          setRoomDetails(prev => ({
            ...prev,
            room_id: 0,
            room_share: 1,
            room_price: 0
          }));
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setShowRoomForm(false);
        }
      } else {
        setError(data.message || 'Failed to add room');
      }
    } catch (err) {
      console.error('Error adding room:', err);
      setError('Failed to add room');
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/add_guest_details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(guestDetails),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMessage('Guest added successfully!');
        
        // Update the local state immediately with the new vacancy count
        setPgDetailsData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            room_details: prevData.room_details.map(room => 
              room.room_id === guestDetails.room_id
                ? { ...room, vacancies: data.room_vacancies }
                : room
            )
          };
        });

        // Close the form after a short delay to show the success message
        setTimeout(() => {
          setShowGuestForm(false);
          setSuccessMessage('');
        }, 2000);
      } else {
        // Handle specific error cases
        if (response.status === 400 && data.message.includes('vacancies')) {
          setError('This room has no available vacancies. Please select another room.');
        } else {
          setError(data.message || 'Failed to add guest');
        }
      }
    } catch (err) {
      console.error('Error adding guest:', err);
      setError('Failed to add guest. Please try again.');
    }
  };

  const fetchPgDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/pg_details/${pgId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPgDetailsData(data);
      } else {
        setError(data.message || 'Failed to fetch PG details');
      }
    } catch (err) {
      console.error('Error fetching PG details:', err);
      setError('Failed to fetch PG details');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/guests?pg_id=${pgId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setGuests(data.guests);
      } else {
        console.error('Failed to fetch guests:', data.message);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
    }
  };

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // First generate any pending bills
      await fetch(`${BACKEND_URL}/bills?pg_id=${pgId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      // Then fetch all bills
      const response = await fetch(`${BACKEND_URL}/all_bills/${pgId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data: AllBillsResponse = await response.json();

      if (data.status === 'success') {
        // Separate bills into paid and unpaid
        const paidBills = data.bills.filter(bill => bill.paid);
        const unpaidBills = data.bills.filter(bill => !bill.paid);
        
        // Sort bills by months in ascending order
        const sortPaidBills = [...paidBills].sort((a, b) => a.months.localeCompare(b.months));
        const sortUnpaidBills = [...unpaidBills].sort((a, b) => a.months.localeCompare(b.months));
        
        setPaidBills(sortPaidBills);
        setUnpaidBills(sortUnpaidBills);
        setTotalPaid(data.total_paid);
        setTotalUnpaid(data.total_unpaid);
      } else {
        console.error('Failed to fetch bills:', data.message);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  useEffect(() => {
    fetchPgDetails();
    fetchGuests();
    fetchBills();
  }, [pgId]);

  const handleAddGuestClick = (roomId: number) => {
    setSelectedRoomId(roomId);
    setGuestDetails(prev => ({ ...prev, room_id: roomId }));
    setShowGuestForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePayBill = async (billId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/bills/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          bill_id: billId,
          pg_id: Number(pgId)
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMessage(`Payment of ₹${data.amount_paid} processed for ${data.guest_name}!`);
        // Refresh bills after payment
        await fetchBills();
        // Also refresh guests to update due amounts
        await fetchGuests();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to process payment');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="pg-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading PG details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pg-details-error">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  if (!pgDetailsData) {
    return (
      <div className="pg-details-error">
        <p>No PG details found</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const renderRoomsSection = () => (
    <div className="rooms-section">
      <div className="rooms-header">
        <h2>Room Details</h2>
        <button 
          className="add-room-button"
          onClick={() => setShowRoomForm(true)}
        >
          + Add New Room
        </button>
      </div>

      {pgDetailsData.room_details.length > 0 ? (
        <div className="rooms-table">
          <div className="table-header table-row">
            <div className="table-cell">Room Number</div>
            <div className="table-cell">Room Share</div>
            <div className="table-cell">Price</div>
            <div className="table-cell">Vacancies</div>
            <div className="table-cell">Actions</div>
          </div>
          {[...pgDetailsData.room_details]
            .sort((a, b) => a.room_id - b.room_id)
            .map((room) => (
              <div key={room.id} className="table-row">
                <div className="table-cell highlight">{room.room_id}</div>
                <div className="table-cell highlight">{room.room_share}</div>
                <div className="table-cell">₹{room.room_price}</div>
                <div className="table-cell highlight">{room.vacancies}</div>
                <div className="table-cell room-actions">
                  <button className="edit-button">Edit</button>
                  <button className="view-button">View</button>
                  {room.vacancies > 0 && (
                    <button 
                      className="add-guest-button"
                      onClick={() => handleAddGuestClick(room.room_id)}
                    >
                      Add Guest
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="no-rooms-message">
          <p>No rooms added yet</p>
          <button 
            className="add-first-room-button"
            onClick={() => setShowRoomForm(true)}
          >
            + Add Your First Room
          </button>
        </div>
      )}
    </div>
  );

  const renderGuestsSection = () => (
    <div className="guests-section">
      <div className="guests-header">
        <h2>Guest Details</h2>
      </div>

      {guests.length > 0 ? (
        <div className="guests-table">
          <div className="table-header table-row">
            <div className="table-cell">Name</div>
            <div className="table-cell">Room</div>
            <div className="table-cell">Phone</div>
            <div className="table-cell">Join Date</div>
            <div className="table-cell">Due Amount</div>
            <div className="table-cell">Next Pay Date</div>
            <div className="table-cell">Actions</div>
          </div>
          {guests.map((guest) => (
            <div key={guest.id} className="table-row">
              <div className="table-cell">{guest.name}</div>
              <div className="table-cell">{guest.room_id}</div>
              <div className="table-cell">{guest.phone}</div>
              <div className="table-cell">{formatDate(guest.date_of_join)}</div>
              <div className="table-cell">₹{guest.due}</div>
              <div className="table-cell">{formatDate(guest.pay_date)}</div>
              <div className="table-cell guest-actions">
                <button 
                  className="view-button"
                  onClick={() => navigate(`/pg/${pgId}/guest/${guest.id}`)}
                >
                  View
                </button>
                <button className="pay-button">Pay Due</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-guests-message">
          <p>No guests added yet</p>
        </div>
      )}
    </div>
  );

  const renderBillsSection = () => (
    <div className="bills-section">
      <div className="bills-summary">
        <div className="summary-card unpaid">
          <h3>Total Unpaid</h3>
          <p>₹{totalUnpaid.toFixed(2)}</p>
        </div>
        <div className="summary-card paid">
          <h3>Total Paid</h3>
          <p>₹{totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="bills-container">
        <div className="unpaid-bills">
          <h3>Pending Bills</h3>
          <div className="bills-table-container">
            {unpaidBills.length > 0 ? (
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Room</th>
                    <th>Amount</th>
                    <th>Month</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidBills.map((bill) => (
                    <tr key={bill.bill_id}>
                      <td>{bill.guest_name}</td>
                      <td>{bill.room_id}</td>
                      <td>₹{bill.amount}</td>
                      <td>{bill.months}</td>
                      <td>
                        <button
                          onClick={() => handlePayBill(bill.bill_id)}
                          className="pay-btn"
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-bills">No pending bills</p>
            )}
          </div>
        </div>

        <div className="paid-bills">
          <h3>Paid Bills</h3>
          <div className="bills-table-container">
            {paidBills.length > 0 ? (
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Room</th>
                    <th>Amount</th>
                    <th>Month</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidBills.map((bill) => (
                    <tr key={bill.bill_id}>
                      <td>{bill.guest_name}</td>
                      <td>{bill.room_id}</td>
                      <td>₹{bill.amount}</td>
                      <td>{bill.months}</td>
                      <td>
                        <span className="paid-status">Paid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-bills">No paid bills</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pg-details-page">
      <nav className="vertical-nav">
        <a href="/dashboard" className="nav-item active">
          <i>🏠</i>
          <span>Home</span>
        </a>
        <a href="/profile" className="nav-item">
          <i>👤</i>
          <span>Profile</span>
        </a>
        <a href="/settings" className="nav-item">
          <i>⚙️</i>
          <span>Settings</span>
        </a>
        <a href="/bag" className="nav-item">
          <i>💼</i>
          <span>Bag</span>
        </a>
      </nav>

      <div className="pg-details-nav">
        <h1>{pgDetailsData.pg_details.pg_name}</h1>
      </div>

      <div className="pg-details-content">
        <div className="pg-stats-cards">
          <div className="stat-card">
            <h3>Total Rooms</h3>
            <p>{pgDetailsData.room_details.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Vacancies</h3>
            <p>{pgDetailsData.room_details.reduce((acc, room) => acc + room.vacancies, 0)}</p>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
          <button 
            className={`tab ${activeTab === 'guests' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('guests');
              fetchGuests();
            }}
          >
            Guests
          </button>
          <button 
            className={`tab ${activeTab === 'bills' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bills');
              fetchBills();
            }}
          >
            Bills
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="tab-content">
            {activeTab === 'rooms' && renderRoomsSection()}
            {activeTab === 'guests' && renderGuestsSection()}
            {activeTab === 'bills' && renderBillsSection()}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showRoomForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Room Details</h2>
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
                >
                  Save & Add Next
                </button>
                <button 
                  type="submit" 
                  className="save-close-btn"
                >
                  Save & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestForm && selectedRoomId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Guest Details</h2>
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            <form onSubmit={handleAddGuest}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={guestDetails.name}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  min="18"
                  value={guestDetails.age}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Aadhar Number:</label>
                <input
                  type="text"
                  value={guestDetails.aadhar_no}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, aadhar_no: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Join:</label>
                <input
                  type="date"
                  value={guestDetails.date_of_join}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, date_of_join: e.target.value }))}
                  required
                />
              </div>
              <div className="button-group">
                <button type="button" onClick={() => setShowGuestForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-close-btn">
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bottom-navigation">
        <button 
          className="back-to-dashboard-btn" 
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PgDetails; 