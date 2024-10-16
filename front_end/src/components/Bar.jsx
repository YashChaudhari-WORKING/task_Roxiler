
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import axios from 'axios';

const TransactionsBarChart = ({ month }) => {
  const [data, setData] = useState([]);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bar?month=${month}`);

        setData(response.data.data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [month]);

  return (
    <div>
      <h2>Transactions Bar Chart for  {monthNames[month-1]}</h2>
      <BarChart
        width={600}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="priceRange" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="itemCount" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default TransactionsBarChart;
