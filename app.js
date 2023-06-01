const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
// to be able to read env file
require('dotenv/config');
//const {authJwt} = require('./helpers/jwt')
//const authJwt = require('./helpers/jwt')
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');


//to permit http request between the api and other frontend
app.use(cors());
app.options('*', cors());

//middlware to parse json data to backend(middlewares)
app.use(bodyparser.json());
//to format thr log
app.use(morgan('tiny'));
//to secure the authentication
app.use(authJwt());
app.use(errorHandler);


const api = process.env.API_URL;

//routes
const productRouter = require('./routers/products.route')
const categoriesRouter = require('./routers/categories.route')
const usersRouter = require('./routers/users.route')
const ordersRouter = require('./routers/orders.route');


app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

///connect to mongodb before starting the sever
mongoose.connect(process.env.CONNECTION_STRING,{
    dbName:'ecommerceapi'
})
.then(()=>{
    console.log('database is connected');
})

app.listen(3000, ()=>{
    console.log('The server is running on port 3000');
})