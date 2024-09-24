import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavLinks = () => (
    <>
      <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
      <Link to="/create" onClick={() => setSidebarOpen(false)}>Create Blog</Link>
      <Link to="/signup" onClick={() => setSidebarOpen(false)}>Account</Link>
    </>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="nav-logo">blogit</Link>
        </div>
        <div className="navbar-right">
          {!isSmallScreen && <NavLinks />}
          {isSmallScreen && (
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
          )}
        </div>
      </nav>
      {isSmallScreen && (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>×</button>
          <NavLinks />
        </div>
      )}
    </>
  );
}

export default Navbar;