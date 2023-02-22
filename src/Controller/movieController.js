const API = require('../Model/API')
const Critics = require('../Model/Critics')
const validator = require('escape-html')
const Users = require('../Model/Users')
const userController = require('../Controller/userController')

const getMovies = async (req, res) => {
    res.send('Olá filmes')
}

const getMovie = async (req, res) => {
    const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
    let movie = await new API(link).request()
    
    movie.critics = await Critics.find({ movieId: req.params.movieId })

    var cssStyles = ['movie.css']
    var jsScripts = ['movie.js', 'jQuery.js']
    var pageTitle = movie.title

    req.ratings.forEach(rating => {
        if(rating.movieId == movie.id)
            movie.rate = rating.value
    });

    movie.avgRating = await Users.aggregate([
        { $unwind: "$Ratings" },
        { $match: { "Ratings.movieId": req.params.movieId }}, // aggregation where clause
        { $group: { "_id": "$Ratings.movieId", "rate": { $avg: "$Ratings.value" }}}
    ])

    movie.avgRating = movie.avgRating?.[0]?.rate

    if(movie.avgRating == null)
        movie.avgRating = movie.vote_average

    res.render('movie', { movie, validator, req, pageTitle, cssStyles, jsScripts })
}

const rateMovie = async (req, res) => {
    try { // update user and generates a new token
        const { rate } = req.body
        var newRate = true

        if(!rate)
            return res.status(400).send('Elementos POST não enviados!')

        for(var i = 0; i < req.ratings.length; i++) {
            if(req.ratings[i].movieId == req.params.movieId) {
                req.ratings[i].value = rate

                newRate = false
                break
            }
        }

        if(newRate)
            req.ratings.push({value: rate, movieId: req.params.movieId})

        const user = {
            id: req.id,
            firstName: req.firstName,
            ratings: req.ratings
        }

        if(req.Image != null)
            user.Image = req.Image

        const token = userController.generateToken(user)

        res.cookie('auth', `Bearer ${token}`, {
            httpOnly: true,
            secure: true
        })

        if(newRate) // rate a new movie
            await Users.updateOne({ _id: req.id }, { $push: { Ratings: { value: rate, movieId: req.params.movieId } } }) 
        else // update
            await Users.updateOne({ _id: req.id }, { $set: { "Ratings.$[element].value": rate } }, { "arrayFilters": [{ "element.movieId": req.params.movieId }]})
        
        res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error)
    }
}

module.exports = {
    getMovies,
    getMovie,
    rateMovie
}