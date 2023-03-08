require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const noSQLSanitizer = require('express-nosql-sanitizer')
const bodyParser = require('body-parser')
const routes = require('./routes/index')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())
app.use('/IMG', express.static('IMG'))
app.use('/views/CSS', express.static('views/CSS'))
app.use('/views/JS', express.static('views/JS'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(noSQLSanitizer({
    mode: noSQLSanitizer.MODE_NORMAL
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_SERVER).then(()=> {
    app.listen(3000)
}).catch((err) => console.log(err))

app.use('/', routes)