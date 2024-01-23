const express = require('express');
const app = express();
const connectDB = require('./config/connectDB');
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const blogRouter = require('./routes/blogRoutes');
const productCategoryRouter = require('./routes/productCategoryRoutes');
const blogCategoryRouter = require('./routes/blogCategoryRoutes');
const couponRouter = require('./routes/coupon');
const brandRouter = require('./routes/brandRoutes');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/not-found');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

require('dotenv').config();

// middlewares
app.use(express.json());
app.use(morgan("dev")); // to display request from postman in console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/product-category', productCategoryRouter);
app.use('/api/blog-category', blogCategoryRouter);
app.use('/api/brands', brandRouter);
app.use('/api/coupon', couponRouter);
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