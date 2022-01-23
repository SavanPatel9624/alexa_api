const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 9000
const cors = require('cors');

// Static Files
app.use(express.static('public/images'));

// cors middleware
app.use(cors());
app.options('*', cors());

//CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);

app.use(bodyParser.urlencoded({ extended : true }));

// Routes
const newsRouter = require('./src/routes/news');
const deleteRouter = require('./src/routes/delete');
const postRouter = require('./src/routes/post');
const getRouter = require('./src/routes/get');
const mysql = require("mysql");

app.use('/', newsRouter);
app.use('/', deleteRouter);
app.use('/', postRouter);
app.use('/', getRouter);

// Listen on port 5000
app.listen(port, () => console.log(`Listening on port ${port}`));