import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav style={{ backgroundColor: '#f0f0f0', padding: '10px 20px' }}>
      <span style={{ fontWeight: 'bold', marginRight: 20 }}>Admin Dashboard</span>
      <button onClick={handleLogout} style={{ float: 'right' }}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
