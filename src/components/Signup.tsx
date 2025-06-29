import React, { useState } from 'react';
import api from '../api/axios';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await api.post('/register', { email, password, name });
            const data = response.data as { status?: string; detail?: string; id?: number; email?: string; name?: string; is_verified?: boolean; platform?: string };
            if (data.id) {
                console.log('Signup successful:', data);
                setSuccess('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000); // Redirect after 2 seconds
            } else {
                setError(data.detail || 'Signup failed. Please check your details and try again.');
            }
        } catch (err) {
            setError('Signup failed. Please check your details and try again.');
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-3 col-md-2"></div>
                <div className="col-lg-6 col-md-8 login-box">
                    <div className="col-lg-12 login-key">
                        <i className="fa fa-user-plus" aria-hidden="true"></i>
                    </div>
                    <div className="col-lg-12 login-title">
                        ADMIN SIGNUP
                    </div>

                    <div className="col-lg-12 login-form">
                        <div className="col-lg-12 login-form">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-control-label">NAME</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-control-label">EMAIL</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-control-label">PASSWORD</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-lg-12 loginbttm">
                                    <div className="col-lg-6 login-btm login-text">
                                        {error && <div className="error-message">{error}</div>}
                                        {success && <div className="success-message">{success}</div>}
                                    </div>
                                    <div className="col-lg-6 login-btm login-button">
                                        <button type="submit" className="btn btn-outline-primary">SIGNUP</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Signup; 