import React, { useState } from 'react';
import api from '../api/axios';
import './Auth.css';
import log from '../utils/logger';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            log.info('Login attempt:', { email });
            const response = await api.post('/login', { email, password });
            const data = response.data as { status: string; message?: string; access_token?: string; token_type?: string };
            log.info('Response from backend:', response.data);
            if (data.status === 'success' && data.access_token) {
                log.info('Login successful, access token stored');
                // Store the access token
                localStorage.setItem('accessToken', data.access_token);
                console.log('Access token stored:', data.access_token);
                // Redirect to dashboard or another page
                window.location.href = '/dashboard';
            } else {
                // Handle error response
                setError(data.message || 'Login failed. Please check your credentials and try again.');
                log.error('Login error:', data.message);
            }
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-3 col-md-2"></div>
                <div className="col-lg-6 col-md-8 login-box">
                    <div className="col-lg-12 login-key">
                        <i className="fa fa-key" aria-hidden="true"></i>
                    </div>
                    <div className="col-lg-12 login-title">
                        PG LOGIN
                    </div>

                    <div className="col-lg-12 login-form">
                        <div className="col-lg-12 login-form">
                            <form onSubmit={handleSubmit}>
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
                                    </div>
                                    <div className="col-lg-6 login-btm login-button">
                                        <button type="submit" className="btn btn-outline-primary">LOGIN</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div style={{ marginTop: '18px', textAlign: 'center', width: '100%' }}>
                        <span style={{ color: '#A2A4A4', fontSize: '14px' }}>
                            Don't have an account?{' '}
                            <a href="/signup" style={{ color: '#0DB8DE', textDecoration: 'underline', fontWeight: 'bold' }}>Sign up</a>
                        </span>
                    </div>
                    <div className="col-lg-3 col-md-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Login; 