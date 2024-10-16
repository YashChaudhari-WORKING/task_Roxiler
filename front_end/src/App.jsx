import React, { useState, useEffect } from 'react';
import { ProductList, ProductFilter } from './components/Dashboard';
import Statistics from './components/Statistics';
import TransactionsBarChart from './components/Bar'; 
import PieChartComponent from './components/PieChart'; 
import './index.css'

function App() {
  const [products, setProducts] = useState([]);
  const [month, setMonth] = useState('3');
  const [searchText, setSearchText] = useState('');
  const [itemsPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMonthChange = (month) => {
    setMonth(month);
  };

  const handleSearch = (searchText) => {
    setSearchText(searchText);
  };

  const onPageChange = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  return (
    <div>
      <div class="header">
  <a  class="logo">Roxiler Task</a>
</div>
        <div>
      <ProductFilter onMonthChange={handleMonthChange} onSearch={handleSearch} />
      <ProductList 
        products={products} 
        month={month} 
        searchText={searchText} 
        itemsPerPage={itemsPerPage} 
        onPageChange={onPageChange} 
      />
    </div>
<div>
<Statistics month={month} />
<div className="chart-container">
  <div className="chart">
    <TransactionsBarChart month={month} />
  </div>
  <div className="chart">
    <PieChartComponent month={month} />
  </div>
</div>
</div>
    </div>
  );
}

export default App;