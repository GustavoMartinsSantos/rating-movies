require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const noSQLSanitizer = require('express-nosql-sanitizer')
const bodyParser = require('body-parser')
const validator = require('escape-html')
const Comments = require('./Model/Comments')
const Critics = require('./Model/Critics')
const API = require('./Model/API')
const authMiddleware = require('./Middlewares/auth')
const Users = require('./Model/Users')

const app = express()
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

mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zifjrp5.mongodb.net/rating-movies`
).then(()=> {
    app.listen(3000)
}).catch((err) => console.log(err))

app.get('/', async (req, res) => {
    //res.send(sanitizer.escape("<script>alert('teste')</script>"))
    res.send(await Comments.find())
})

app.get('/movie/:movieId', authMiddleware, async (req, res) => {
    const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
    let movie = await new API(link).request()

    if(!movie.title)
        res.redirect('http://localhost:3000/')
    
    movie.critics = await Critics.find({ movieId: req.params.movieId })

    var cssStyles = ['movie.css']
    var jsScripts = ['movie.js']
    var pageTitle = movie.title
    res.render('movie', { movie, validator, req, pageTitle, cssStyles, jsScripts })
})

app.use('/', require('./Controller/userController'))
app.use('/movie/', require('./Controller/commenController'))
app.use('/movie/', require('./Controller/criticController'))