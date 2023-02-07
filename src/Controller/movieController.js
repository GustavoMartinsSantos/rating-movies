const API = require('../Model/API')
const Critics = require('../Model/Critics')
const validator = require('escape-html')

const getMovies = async (req, res) => {
    res.send('Olá filmes')
}

const getMovie = async (req, res) => {
    const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
    let movie = await new API(link).request()
    
    movie.critics = await Critics.find({ movieId: req.params.movieId })

    var cssStyles = ['movie.css']
    var jsScripts = ['movie.js']
    var pageTitle = movie.title
    res.render('movie', { movie, validator, req, pageTitle, cssStyles, jsScripts })
}

module.exports = {
    getMovies,
    getMovie
}