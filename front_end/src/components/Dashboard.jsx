  import React, { useState, useEffect } from 'react';
  import './Dashboard.css'; 

  const ProductList = ({ products, month, searchText, itemsPerPage, onPageChange }) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
      filterProducts();
    }, [products, month, searchText]);

    const filterProducts = () => {
      const filtered = products.filter(product => {
        const productDate = new Date(product.dateOfSale);
        const productMonth = productDate.getMonth() + 1; 
        const matchesMonth = productMonth === Number(month);
        const matchesQuery =
          product.title.toLowerCase().includes(searchText.toLowerCase()) ||
          product.description.toLowerCase().includes(searchText.toLowerCase()) ||
          product.price.toString().includes(searchText);

        return matchesMonth && (searchText === '' || matchesQuery);
      });
      setFilteredProducts(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };

    const handleNextPage = () => {
      if (pageNumber < totalPages) {
        setPageNumber(pageNumber + 1);
        onPageChange(pageNumber + 1);
      }
    };

    const handlePreviousPage = () => {
      if (pageNumber > 1) {
        setPageNumber(pageNumber - 1);
        onPageChange(pageNumber - 1);
      }
    };

    const currentItems = filteredProducts.slice((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage);

    return (
      <div className="product-container">
        <h1>Product List</h1>
        <ul className="space-y-4"> 
          {currentItems.map(product => (
            <li key={product.id} className="product-card">
              <img src={product.image} alt="Product" className="product-image" />
              <div className="product-info">
                <h2 className="product-title">{product.title}  <p className="product-category">#{product.category}</p></h2>
                <h3 className="product-date">{new Date(product.dateOfSale).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}</h3>
                <p>{product.description}</p>
                <p className="product-price">Price: ${product.price}</p>
                <p
  className={`product-status ${product.sold ? 'text-red-500' : 'text-green-500'}`}
  style={{
    backgroundColor: product.sold ? 'red' : 'green', 
    color: 'white', 
    padding: '5px 10px', 
    borderRadius: '5px', 
  }}
>
  {product.sold ? 'Sold' : 'In Stock'}
</p>
              
              </div>
            </li>
          ))}
        </ul>
        <div className="pagination-buttons">
          <button onClick={handlePreviousPage} disabled={pageNumber === 1}>Previous</button>
          <p>Total Products: {filteredProducts.length}</p>
        <p>Total Pages: {totalPages}</p>
          <button onClick={handleNextPage} disabled={pageNumber === totalPages}>Next</button>
        </div>
      
        
      </div>
    );
  };

  const ProductFilter = ({ onMonthChange, onSearch }) => {
    const [month, setMonth] = useState('3');
    const [searchText, setSearchText] = useState('');

    const handleMonthChange = (e) => {
      setMonth(e.target.value);
      onMonthChange(e.target.value);
    };

    const handleSearch = (e) => {
      setSearchText(e.target.value);
      onSearch(e.target.value);
    };

    return (
      <div className="container">
        <label htmlFor="month-select">Select Month:</label>
        <select id="month-select" value={month} onChange={handleMonthChange}>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <div>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchText} 
            onChange={handleSearch} 
            className="border border-gray-300 rounded p-2" 
          />
        </div>
      </div>
    );
  };

  export { ProductList, ProductFilter };
