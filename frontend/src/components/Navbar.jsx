import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, UserCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <Building2 size={24} />
        </div>
        <div className="nav-brand-text">
          <h1>Rehan ECE</h1>
          <p>Enterprise Employee Portal</p>
        </div>
      </div>

      <div className="user-profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={18} color="var(--primary)" />
          <div className="user-info">
            <div className="user-name">{user?.name || 'Administrator'}</div>
            <div className="user-email">{user?.email || 'admin@company.com'}</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-icon" onClick={logout} title="Sign Out">
          <LogOut size={18} />
          <span style={{ fontSize: '0.82rem' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
