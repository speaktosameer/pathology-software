const SummaryCard = ({ title, value }) => (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      width: '200px',
      marginRight: '20px',
      background: '#f8f9fa'
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
  
  export default SummaryCard;
  