const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

require('dotenv').config();

const propertyRoutes =
  require('./routes/propertyRoutes');

const app = express();


// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ROUTES
app.use(
  '/api/properties',
  propertyRoutes
);


// TEST ROUTE
app.get('/', (req, res) => {

  res.send(
    'Sri Sai Real Estate API Running'
  );

});


// CONNECT MONGODB
mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

  console.log(
    '✅ MongoDB Connected'
  );

  app.listen(

    process.env.PORT || 5000,

    () => {

      console.log(
        `🚀 Server running on port ${process.env.PORT || 5000}`
      );

    }

  );

})

.catch((err) => {

  console.log(
    '❌ MongoDB failed:',
    err.message
  );

});