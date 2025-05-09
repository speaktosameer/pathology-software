import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ChangePassword = ({ username }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/Admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || "admin",  // replace with actual logged-in username if stored
        currentPassword,
        newPassword
      })
    });

    if (response.ok) {
      toast.success("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
    } else {
      const msg = await response.text();
      toast.error("Failed: " + msg);
    }
  };

  return (
    <div className="card" style={{ padding: "20px", maxWidth: "400px", margin: "20px auto" }}>
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="form-control my-2"
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="form-control my-2"
      />
      <button className="btn btn-primary" onClick={handleChangePassword}>
        Update Password
      </button>
    </div>
  );
};

export default ChangePassword;
