import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const TransactionStatistics = ({ month }) => {


  
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalUnsoldItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/statistics?month=${month}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (month) {
      fetchStatistics();
    }
  }, [month]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="statistics-container">
  <h2 className="statistics-title">Transaction Statistics for {monthNames[month-1]}</h2>
  <div className="statistics-content">
    <div className="statistic-item">
      <h3 className="statistic-label">Total Sale Amount:</h3>
      <p className="statistic-value">${statistics.totalSaleAmount.toFixed(2)}</p>
    </div>
    <div className="statistic-item">
      <h3 className="statistic-label">Total Sold Items:</h3>
      <p className="statistic-value">{statistics.totalSoldItems}</p>
    </div>
    <div className="statistic-item">
      <h3 className="statistic-label">Total Unsold Items:</h3>
      <p className="statistic-value">{statistics.totalUnsoldItems}</p>
    </div>
  </div>
</div>
  );
};

export default TransactionStatistics;