const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 9000
const cors = require('cors');

// Static Files
app.use(express.static(__dirname + "/public/"))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/images', express.static(__dirname + 'public/images'))
app.use('/js', express.static(__dirname + 'public/js'))

// Templating Engine
app.set('views', './src/views')
app.set('view engine', 'ejs')

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

app.use(bodyParser.urlencoded({ extended : true }))

// Routes
const newsRouter = require('./src/routes/news')

app.use('/', newsRouter)

// Listen on port 5000
app.listen(port, () => console.log(`Listening on port ${port}`))