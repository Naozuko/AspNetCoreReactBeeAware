import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [showSubMenu, setShowSubMenu] = useState(false);
    const location = useLocation();

    return (
        <div className="main-container">
            <div className="top-navbar">
                <div>Home</div>
                <div>Logout</div>
            </div>

            <div className="main-content">
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
                        <div className="module-icon"><i className="fas fa-user"></i></div>
                        <div className="module-label">Account</div>
                    </div>
                </div>

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
                        {showSubMenu && (
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