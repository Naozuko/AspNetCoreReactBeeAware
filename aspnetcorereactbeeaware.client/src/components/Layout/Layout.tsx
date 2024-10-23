import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [showSubMenu, setShowSubMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="main-container">
            <div className="top-navbar">
                <div>Home</div>
                {isAuthenticated ? (
                    <div onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</div>
                ) : (
                    <Link to="/auth">Login</Link>
                )}
            </div>

            <div className="main-content">
                {isAuthenticated && (
                    <div className="modules-navbar">
                        <div className="module-item">
                            <div className="module-icon"><i className="fas fa-bug"></i></div>
                            <div className="module-label">Pests and Diseases</div>
                        </div>
                        <div className="module-item">
                            <div className="module-icon"><i className="fas fa-leaf"></i></div>
                            <div className="module-label">Bee Flora</div>
                        </div>
                        <div className="module-item" onClick={() => setShowSubMenu(!showSubMenu)}>
                            <div className="module-icon"><i className="fas fa-archive"></i></div>
                            <div className="module-label">Beekeeping</div>
                        </div>
                        <div className="module-item">
                            <div className="module-icon"><i className="fas fa-comments"></i></div>
                            <div className="module-label">ChatRoom</div>
                        </div>
                        <div className="module-item">
                            <div className="module-icon"><i className="fas fa-image"></i></div>
                            <div className="module-label">Gallery</div>
                        </div>
                        <div className="module-item">
                            <div className="module-icon"><i className="fas fa-user"></i></div>
                            <div className="module-label">Account</div>
                        </div>
                    </div>
                )}

                <div className="right-content">
                    <div className="breadcrumb-container">
                        <i className="fas fa-bars" style={{ marginRight: '10px' }}></i>
                        <Link to="/">Home</Link>
                        {location.pathname !== '/' && (
                            <>
                                <span className="separator">/</span>
                                <Link to="/beekeeping">Beekeeping</Link>
                                {location.pathname !== '/beekeeping' && (
                                    <>
                                        <span className="separator">/</span>
                                        <span>{location.pathname.split('/').pop()}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="sub-content">
                        {isAuthenticated && showSubMenu && (
                            <div className="sub-navbar">
                                <Link to="/beekeeping/apiaries" className={`sub-menu-item ${location.pathname === '/beekeeping/apiaries' ? 'active' : ''}`}>Apiaries</Link>
                                <Link to="/beekeeping/hives" className={`sub-menu-item ${location.pathname === '/beekeeping/hives' ? 'active' : ''}`}>Hives</Link>
                                <Link to="/beekeeping/inspections" className={`sub-menu-item ${location.pathname === '/beekeeping/inspections' ? 'active' : ''}`}>Inspections</Link>
                            </div>
                        )}
                        <div className="content-area">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;