import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [editingTests, setEditingTests] = useState([]);
  const [historyMap, setHistoryMap] = useState({});
  const [scannedFile, setScannedFile] = useState(null);


  useEffect(() => {
    fetch(`http://localhost:5000/api/LabOrder/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setEditingTests(data.orderTests.map(t => ({
          orderTestId: t.orderTestId,
          resultValue: t.resultValue,
          resultUnit: t.resultUnit,
          resultFlag: t.resultFlag,
          notes: t.notes || ''
        })));
      });
  }, [id]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { background: '#4CAF50', color: '#fff' };
      case 'pending': return { background: '#FFC107', color: '#000' };
      case 'in_process': return { background: '#2196F3', color: '#fff' };
      default: return {};
    }
  };

  const updateTestField = (id, field, value) => {
    setEditingTests(prev =>
      prev.map(t => t.orderTestId === id ? { ...t, [field]: value } : t)
    );
  };

  const saveTestResult = async (test) => {
    await fetch(`http://localhost:5000/api/OrderTest/${test.orderTestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    toast.success('Test result updated');
  };

  const markOrderComplete = async () => {
    const updated = { ...order, status: 'completed' };
    await fetch(`http://localhost:5000/api/LabOrder/${order.labOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    toast.success('Order marked as completed');
    setOrder(updated);
  };

  const handleDownload = async () => {
    const response = await fetch(`http://localhost:5000/api/Report/${id}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-report-${id}.pdf`;
    a.click();
  };

  const handleSend = async () => {
    await fetch(`http://localhost:5000/api/Report/send/${id}`, { method: 'POST' });
    toast.success('Report sent to patient email');
  };

  const printReport = () => {
    window.print();
  };

  const fetchHistory = async (patientId, testId, orderTestId) => {
    if (historyMap[orderTestId]) return;

    const res = await fetch(`http://localhost:5000/api/LabOrder/TestHistory?patientId=${patientId}&testId=${testId}`);
    const data = await res.json();
    setHistoryMap(prev => ({ ...prev, [orderTestId]: data }));
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>Order #{order.labOrderId}</h2>

      <h3>Patient: {order.patient?.name}</h3>
      <h3>Doctor: {order.doctor?.name}</h3>
      <p>
        Status:
        <span style={{
          ...getStatusStyle(order.status),
          padding: '4px 10px',
          marginLeft: '10px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
        | Payment: {order.paymentStatus}
      </p>
      <p>Ordered on: {new Date(order.orderDate).toLocaleDateString()}</p>

      <h4>Tests:</h4>
      <table border="1" cellPadding="8" style={{ marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Save</th>
            <th>History</th>
            <th>Notes</th>

          </tr>
        </thead>
        <tbody>
          {editingTests.map(test => {
            const full = order.orderTests.find(t => t.orderTestId === test.orderTestId);
            return (
              <React.Fragment key={test.orderTestId}>
                <tr>
                  <td>{full.test.name}</td>
                  <td>
                    <input value={test.resultValue || ''} onChange={(e) => updateTestField(test.orderTestId, 'resultValue', e.target.value)} />
                  </td>
                  <td>
                    <input value={test.resultUnit || ''} onChange={(e) => updateTestField(test.orderTestId, 'resultUnit', e.target.value)} />
                  </td>
                  <td>
                    <select value={test.resultFlag || ''} onChange={(e) => updateTestField(test.orderTestId, 'resultFlag', e.target.value)}>
                      <option value="">--</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveTestResult(test)}>Save</button>
                  </td>
                  <td>
                    <button onClick={() => fetchHistory(order.patient.patientId, full.test.testId, test.orderTestId)}>
                      View History
                    </button>
                  </td>
                </tr>
                {historyMap[test.orderTestId] && (
                  <tr>
                    <td colSpan="6">
                      <strong>Previous Results:</strong>
                      <ul>
                        {historyMap[test.orderTestId].map((h, i) => (
                          <li key={i}>
                            {new Date(h.orderDate).toLocaleDateString()}: {h.resultValue} {h.resultUnit} ({h.resultFlag})
                          </li>
                        ))}
                      </ul>
                      {historyMap[test.orderTestId] && historyMap[test.orderTestId].length > 1 && (
  <div style={{ width: '100%', maxWidth: '600px', marginTop: '10px' }}>
    <Line
      data={{
        labels: historyMap[test.orderTestId].map(h => new Date(h.orderDate).toLocaleDateString()),
        datasets: [{
          label: `${full.test.name} Trend`,
          data: historyMap[test.orderTestId].map(h => parseFloat(h.resultValue)),
          borderColor: 'rgba(75,192,192,1)',
          fill: false
        }]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Test Result Trend' }
        }
      }}
    />
  </div>
)}

                    </td>
                    <td>
  <textarea
    rows="2"
    value={test.notes || ''}
    onChange={(e) => updateTestField(test.orderTestId, 'notes', e.target.value)}
  />
</td>

                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
  <input type="file" accept="application/pdf" onChange={(e) => setScannedFile(e.target.files[0])} />
  <button onClick={async () => {
    if (!scannedFile) return;
    const formData = new FormData();
    formData.append("file", scannedFile);
    const res = await fetch(`http://localhost:5000/api/LabOrder/upload-report/${id}`, {
      method: "POST",
      body: formData
    });
    if (res.ok) toast.success("Scanned report uploaded");
    else toast.error("Upload failed");
  }}>Upload PDF</button>
</div>
{order.scannedReportPath && (
  <p style={{ marginTop: 10 }}>
    Scanned Report:
    <a href={`http://localhost:5000/${order.scannedReportPath}`} target="_blank" rel="noreferrer">
      View PDF
    </a>
  </p>
)}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleDownload}>Download Report</button>
        <button onClick={handleSend} style={{ marginLeft: 10 }}>Send Report</button>
        <button onClick={printReport} style={{ marginLeft: 10 }}>Print Page</button>
        <a
          href={`http://localhost:5000/api/Report/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: 10 }}
        >
          View PDF
        </a>
        <a
  href={`http://localhost:5000/api/LabOrder/invoice/${id}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ marginLeft: 10 }}
>
  Download Invoice
</a>

      </div>

      <button onClick={markOrderComplete} style={{ marginTop: 20 }}>
        Mark Order as Completed
      </button>
      <button onClick={async () => {
  const res = await fetch(`http://localhost:5000/api/LabOrder/send-to-doctor/${id}`, {
    method: "POST"
  });
  if (res.ok) toast.success("Report sent to doctor");
  else toast.error("Failed to send");
}}>
  Send to Doctor
</button>

    </div>
  );
};

export default OrderDetail;
