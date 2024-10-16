const express = require('express');
const axios = require('axios');
const ProductTransaction = require('../models/ProductTransaction');

const router = express.Router();

//api for seeding the data in db--------------------------------------------------------------------------------------
router.get('/initialize-db', async (req, res) => {
  try {
   
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'No transactions found in the API response.' });
    }

    const bulkOps = transactions.map(transaction => ({
      updateOne: {
        filter: { id: transaction.id }, 
        update: {
          $set: {
            ...transaction,
            transaction_date: transaction.dateOfSale, 
          },
        },
        upsert: true, 
      },
    }));

   
    const result = await ProductTransaction.bulkWrite(bulkOps);

    
    res.json({
      message: `Database initialization complete. Upserted: ${result.upsertedCount} records.`,
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize the database.', details: error.message });
  }
});


  //api for listing transactions-----------------------------------------------------------------------------------

    router.get('/transactions', async (req, res) => {
      try {
        const { search, page = 1, perPage = 10 } = req.query;
    
     
        const parsedPage = parseInt(page, 10);
        const parsedPerPage = parseInt(perPage, 10);
    
        if (isNaN(parsedPage) || isNaN(parsedPerPage)) {
          return res.status(400).json({ error: "Invalid pagination values" });
        }
    
        let searchQuery = {};
    
        if (search) {
          const searchRegex = new RegExp(search, 'i'); 
    
          searchQuery = {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
            
            ],
          };
        }
    
        const skip = (parsedPage - 1) * parsedPerPage;
        const limit = parsedPerPage;

        const totalCount = await ProductTransaction.countDocuments(searchQuery);
    
        const transactions = await ProductTransaction.find(searchQuery)
          .skip(skip)
          .limit(limit);
    
        res.json({
          totalRecords: totalCount,
          totalPages: Math.ceil(totalCount / parsedPerPage),
          currentPage: parsedPage,
          perPage: limit,
          transactions,
        });
      } catch (error) {
        console.error("Error occurred while fetching transactions:", error);
        res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
      }
    });




  //api to get statistics data---------------------------------------------------------------------
  router.get('/statistics', async (req, res) => {
    const { month } = req.query; 
    const selectedMonth = parseInt(month); 
  
    if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({ message: 'Invalid month parameter. Please provide a valid month (1-12).' });
    }
  
    try {
      
      console.log('Selected Month:', selectedMonth);
  
  
      const soldItems = await ProductTransaction.aggregate([
        {
          $addFields: {
            month: { $month: "$dateOfSale" }  
          }
        },
        {
          $match: {
            sold: true,
            month: selectedMonth
          }
        }
      ]);
  
    
      const unsoldItems = await ProductTransaction.aggregate([
        {
          $addFields: {
            month: { $month: "$dateOfSale" }
          }
        },
        {
          $match: {
            sold: false,
            month: selectedMonth
          }
        }
      ]);
  
      const totalSaleAmount = soldItems.reduce((total, item) => total + item.price, 0);
      const totalSoldItems = soldItems.length;
      const totalUnsoldItems = unsoldItems.length;
  
      res.json({
        totalSaleAmount,
        totalSoldItems,
        totalUnsoldItems,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });
  

  //api for bar graph data----------------------------------------------------------------------------------------------------

  router.get('/bar', async (req, res) => {
    const { month } = req.query; 
    const selectedMonth = parseInt(month);
  
    if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({ message: 'Invalid month parameter. Please provide a valid month (1-12).' });
    }
  
    try {

      const result = await ProductTransaction.aggregate([
        {
       
          $addFields: {
            month: { $month: "$dateOfSale" }
          }
        },
        {
      
          $match: {
            month: selectedMonth
          }
        },
        {
    
          $bucket: {
            groupBy: "$price", 
            boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901, Infinity], 
            default: "901-above", 
            output: {
              count: { $sum: 1 } 
            }
          }
        }
      ]);
  
      const formattedResult = result.map(item => {
        return {
          priceRange: item._id === "901-above" ? "901-above" : `${item._id - 100}-${item._id - 1}`,
          itemCount: item.count
        };
      });

      res.json({
        month: selectedMonth,
        data: formattedResult
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });



  //api for pie chart data----------------------------------------------------------------------------------------------

  router.get('/pie', async (req, res) => {
    const { month } = req.query; 
    const selectedMonth = parseInt(month);
  
    if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({ message: 'Invalid month parameter. Please provide a valid month (1-12).' });
    }
  
    try {
      const result = await ProductTransaction.aggregate([
        {
          $addFields: {
            month: { $month: "$dateOfSale" }
          }
        },
        {
          $match: {
            month: selectedMonth
          }
        },
        {
          $group: {
            _id: "$category", 
            itemCount: { $sum: 1 } 
          }
        }
      ]);
  

      const formattedResult = result.map(item => {
        return {
          category: item._id,
          itemCount: item.itemCount
        };
      });

      res.json({
        month: selectedMonth,
        data: formattedResult
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });

  
//api for combined data res---------------------------------------------------------------------------------------------------

router.get('/combined', async (req, res) => {
  const { month } = req.query; 
  const selectedMonth = parseInt(month);

  if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
    return res.status(400).json({ message: 'Invalid month parameter. Please provide a valid month (1-12).' });
  }

  try {
  
    const [barChartData, pieChartData, totalSalesData] = await Promise.all([
      axios.get(`${'http://localhost:5000'}/api/bar`, { params: { month: selectedMonth } }),
      axios.get(`${'http://localhost:5000'}/api/pie`, { params: { month: selectedMonth } }),
      axios.get(`${'http://localhost:5000'}/api/statistics`, { params: { month: selectedMonth } }),
    ]);

    const combinedResponse = {
      month: selectedMonth,
      barChartData: barChartData.data,
      pieChartData: pieChartData.data,
      totalSalesData: totalSalesData.data
    };

  
    res.json(combinedResponse);

  } catch (error) {
    console.error('Error fetching data from one or more APIs:', error);
    res.status(500).json({ message: 'Error fetching data from one or more APIs', error });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await ProductTransaction.find().exec();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


module.exports = router;
