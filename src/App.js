import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderDetail from './pages/OrderDetail';
import ChangePassword from './pages/ChangePassword';


const App = () => (
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
    <Route path="/change-password" element={<ChangePassword username={"admin"} />} />
  </Routes>
  <ToastContainer/>
</BrowserRouter>
);

export default App;
