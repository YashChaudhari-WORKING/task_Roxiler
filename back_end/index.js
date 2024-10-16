const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors')
const axios = require('axios');
const Master_router = require('./routes/allRoutes');


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


mongoose.connect('mongodb://localhost:27017/productDB', {
    useNewUrlParser: true,  
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());
app.use(cors());


app.use('/api', Master_router);

async function seedData() {
    try {
      const response = await axios.get('http://localhost:5000/api/initialize-db');
      console.log(response.data);
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
  
  seedData();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
