import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import SummaryCard from '../components/SummaryCard';
import { Bar, Pie } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';



ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement);

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const handleDownload = async (labOrderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/Report/${labOrderId}`, {
        method: 'GET'
      });
  
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lab-report-${labOrderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };
  const handleSend = async (labOrderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/Report/send/${labOrderId}`, {
        method: 'POST'
      });
  
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
  
      toast.success(`Report emailed successfully for Order ID ${labOrderId}`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send report');
    }
  };
  
  const ordersPerDay = {};
  orders.forEach(o => {
      const date = new Date(o.orderDate).toLocaleDateString();
      ordersPerDay[date] = (ordersPerDay[date] || 0) + 1;
    });
    
    const paymentStatusCount = { paid: 0, pending: 0 };
    orders.forEach(o => paymentStatusCount[o.paymentStatus]++);
    
    const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        const matchStatus = statusFilter ? o.status === statusFilter : true;
        const matchStart = start ? orderDate >= start : true;
        const matchEnd = end ? orderDate <= end : true;
        
        return matchStatus && matchStart && matchEnd;
    });
    const totalOrders = filteredOrders.length;
  const totalIncome = filteredOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const exportToCSV = () => {
    const csv = Papa.unparse(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `filtered-lab-orders.csv`);
  };
  
  
  
  

  useEffect(() => {
    axios.get('http://localhost:5000/api/Admin/LabOrders') // Replace port if needed
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
    <Navbar/>
    <div style={{ padding: 20 }}>
      <h2>Lab Orders Dashboard</h2>
      <div style={{ marginBottom: '20px' }}>
  <label>Status: </label>
  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
    <option value="">All</option>
    <option value="pending">Pending</option>
    <option value="in_process">In Process</option>
    <option value="completed">Completed</option>
  </select>

  <label style={{ marginLeft: 20 }}>Start Date: </label>
  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

  <label style={{ marginLeft: 20 }}>End Date: </label>
  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
</div>

      <div style={{ display: 'flex', marginBottom: '30px' }}>
  <SummaryCard title="Total Orders" value={totalOrders} />
  <SummaryCard title="Total Income" value={`Rs. ${totalIncome}`} />
</div>

<div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
  <div style={{ width: '50%' }}>
    <h4>Orders Over Time</h4>
    <Bar data={{
      labels: Object.keys(ordersPerDay),
      datasets: [{
        label: 'Orders',
        data: Object.values(ordersPerDay),
        backgroundColor: 'rgba(75,192,192,0.6)'
      }]
    }} />
  </div>

  <div style={{ width: '30%' }}>
    <h4>Payment Status</h4>
    <Pie data={{
      labels: ['Paid', 'Pending'],
      datasets: [{
        data: [paymentStatusCount.paid, paymentStatusCount.pending],
        backgroundColor: ['#4CAF50', '#FF9800']
      }]
    }} />
  </div>
</div>
<button onClick={exportToCSV} style={{ marginTop: 10 }}>
  Export Filtered Orders (CSV)
</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
              <tr key={order.labOrderId}>
<td>
  <button onClick={() => navigate(`/order/${order.labOrderId}`)}>
    #{order.labOrderId}
  </button>
</td>
              <td>{order.patientName}</td>
              <td>{order.doctorName}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>{order.finalAmount}</td>
              <td>{order.status}</td>
              <td>{order.paymentStatus}</td>
              <td>
                <button onClick={() => handleDownload(order.labOrderId)}>Download</button>
                <button style={{ marginLeft: '10px' }} onClick={() => handleSend(order.labOrderId)}>Send</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
          </>
  );
};

export default Dashboard;
