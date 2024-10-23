import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Auth.css';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'error' | 'success'>('error');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!isLogin && password !== confirmPassword) {
            setMessage("Passwords don't match");
            setMessageType('error');
            return;
        }

        try {
            let response;
            if (isLogin) {
                response = await axios.post('/api/account/login', { username, password });
                login(response.data.token);
                setMessage('Login successful');
                setMessageType('success');
                navigate('/');
            } else {
                response = await axios.post('/api/account/signup', { username, email, password });
                setMessage('Sign up successful. Please log in.');
                setMessageType('success');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data);
                setMessageType('error');
            } else {
                setMessage('An error occurred');
                setMessageType('error');
            }
        }
    };

    const generateHexagons = () => {
        const hexagons = [];
        for (let i = 0; i < 20; i++) {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.2 + 0.1,
            };
            hexagons.push(<div key={i} className="hexagon-bg" style={style} />);
        }
        return hexagons;
    };

    return (
        <div className="auth-page">
            {generateHexagons()}
            <div className="auth-container">
                <div className="auth-header">
                    <h2>{isLogin ? 'Welcome Back!' : 'Join the Hive'}</h2>
                    <p>{isLogin ? 'Sweet to see you again!' : 'Create your new account'}</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm your password"
                            />
                        </div>
                    )}
                    <button type="submit" className="auth-button">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                    {message && (
                        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                            {message}
                        </div>
                    )}
                    <button
                        type="button"
                        className="toggle-button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage('');
                            setPassword('');
                            setConfirmPassword('');
                        }}
                    >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;