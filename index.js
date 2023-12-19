const express = require('express');
const app = express();
const connectDB = require('./config/connectDB');
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/not-found');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/', (req, res) => {
  res.send("Hello from server")
})

app.use(notFound);
app.use(errorHandler)

const Port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(Port, () => {
      console.log(`server is running in port: ${Port}`);
    })
  } catch (error) {
    console.log(error);
  }
}

start();