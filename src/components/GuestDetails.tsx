import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GuestDetails.css';

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
  pg_id: number;
}

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

const BACKEND_URL = 'http://localhost:8000';

const GuestDetails = () => {
  const { pgId, guestId } = useParams();
  const navigate = useNavigate();
  const [guestDetails, setGuestDetails] = useState<GuestDetail | null>(null);
  const [paidBills, setPaidBills] = useState<BillDetail[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<BillDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchGuestDetails();
  }, [pgId, guestId]);

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
        setSuccessMessage(`Payment processed successfully!`);
        // Refresh guest details to update bills and due amount
        fetchGuestDetails();
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

  const fetchGuestDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/guest_details/${pgId}/${guestId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setGuestDetails(data.guest_details);
        // Sort bills by months in descending order (newest first)
        const sortedPaidBills = [...(data.paid_bills || [])].sort((a, b) => 
          new Date(b.months).getTime() - new Date(a.months).getTime()
        );
        const sortedUnpaidBills = [...(data.unpaid_bills || [])].sort((a, b) => 
          new Date(b.months).getTime() - new Date(a.months).getTime()
        );
        setPaidBills(sortedPaidBills);
        setUnpaidBills(sortedUnpaidBills);
      } else {
        setError(data.message || 'Failed to fetch guest details');
      }
    } catch (err) {
      console.error('Error fetching guest details:', err);
      setError('Failed to fetch guest details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="guest-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading guest details...</p>
      </div>
    );
  }

  if (error || !guestDetails) {
    return (
      <div className="guest-details-error">
        <p>{error || 'Guest not found'}</p>
        <button onClick={() => navigate(`/pg/${pgId}`)}>Back to PG Details</button>
      </div>
    );
  }

  return (
    <div className="guest-details-page">
      <nav className="vertical-nav">
        <a href="/dashboard" className="nav-item">
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
      </nav>

      <div className="main-content">
        <div className="guest-details-nav">
          <h1>{guestDetails?.name}'s Details</h1>
        </div>

        <div className="guest-details-content">
          <div className="guest-info-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{guestDetails?.name}</span>
              </div>
              <div className="info-item">
                <label>Age</label>
                <span>{guestDetails?.age}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{guestDetails?.phone}</span>
              </div>
              <div className="info-item">
                <label>Aadhar Number</label>
                <span>{guestDetails?.aadhar_no}</span>
              </div>
              <div className="info-item">
                <label>Room Number</label>
                <span>{guestDetails?.room_id}</span>
              </div>
              <div className="info-item">
                <label>Join Date</label>
                <span>{formatDate(guestDetails?.date_of_join)}</span>
              </div>
              <div className="info-item">
                <label>Next Pay Date</label>
                <span>{formatDate(guestDetails?.pay_date)}</span>
              </div>
              <div className="info-item">
                <label>Due Amount</label>
                <span>₹{guestDetails?.due}</span>
              </div>
            </div>
          </div>

          <div className="bills-section">
            <div className="pending-bills">
              <h2>Pending Bills</h2>
              {unpaidBills.length > 0 ? (
                <div className="bills-table">
                  <div className="table-header">
                    <div>Month</div>
                    <div>Amount</div>
                    <div>Actions</div>
                  </div>
                  {unpaidBills.map((bill) => (
                    <div key={bill.bill_id} className="table-row">
                      <div>{bill.months}</div>
                      <div>₹{bill.amount}</div>
                      <div>
                        <button
                          className="pay-button"
                          onClick={() => handlePayBill(bill.bill_id)}
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-bills">No pending bills</p>
              )}
            </div>

            <div className="payment-history">
              <h2>Payment History</h2>
              {paidBills.length > 0 ? (
                <div className="bills-table">
                  <div className="table-header">
                    <div>Month</div>
                    <div>Amount</div>
                    <div>Status</div>
                  </div>
                  {paidBills.map((bill) => (
                    <div key={bill.bill_id} className="table-row">
                      <div>{bill.months}</div>
                      <div>₹{bill.amount}</div>
                      <div>
                        <span className="paid-status">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-bills">No payment history</p>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <button 
          className="back-button"
          onClick={() => navigate(`/pg/${pgId}`)}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GuestDetails; 