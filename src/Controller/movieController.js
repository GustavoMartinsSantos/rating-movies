const API = require('../Model/API')
const Critics = require('../Model/Critics')
const validator = require('escape-html')
const Users = require('../Model/Users')
const userController = require('../Controller/userController')

const getMovies = async (req, res) => {
    try {
        var link, results
        var search    = req.query.search ?? ""
        var page      = req.query.page ?? 1
        var lists     = []
        var favorites = []
        
        if(search != "") {
            link = `https://api.themoviedb.org/3/search/multi?api_key=${process.env.API_KEY}&language=pt-BR&query=${search}&page=${page}`
            results = await new API(link).request()
            results = results.results

            lists.push({ title: `Pesquisar por ${search}`,
                         movies: results })
        }

        link = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=pt-BR&page=${page}`
        results = await new API(link).request()
        results = results.results

        lists.push({ title: "Populares",
                     movies: results })

        if(req?.id != undefined) {
            for(var c = 0; c < req.favorites.length; c++) {
                link = `https://api.themoviedb.org/3/movie/${req.favorites[c].movieId}?api_key=${process.env.API_KEY}&language=pt-BR&page=${page}`
                results = await new API(link).request()
                
                favorites.push(results)
            }

            if(req.favorites.length > 0)
                lists.push({ title: "Lista de Relevância",
                            movies: favorites })
        }

        var jsScripts = ['jQuery.js']
        var cssStyles = ['style.css']
        var pageTitle = 'Rating Movies'

        return res.render('main', { pageTitle, validator, req, search, lists, jsScripts, cssStyles })
    } catch (error) {
        return res.send(error.stack)
    }
}

const getMovie = async (req, res) => {
    try {
        const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let movie = await new API(link).request()

        if(!movie.title) {
            const link = `https://api.themoviedb.org/3/tv/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
            movie = await new API(link).request()

            movie.title = movie.name
            movie.release_date = movie.first_air_date
            movie.original_title = movie.original_name
        }
        
        movie.critics = await Critics.find({ movieId: req.params.movieId })

        var cssStyles = ['movie.css']
        var jsScripts = ['movie.js', 'jQuery.js']
        var pageTitle = movie.title

        if(req?.id != undefined) {
            req.ratings.forEach(rating => {
                if(rating.movieId == movie.id)
                    movie.rate = rating.value
            });

            movie.avgRating = await Users.aggregate([
                { $unwind: "$Ratings" },
                { $match: { "Ratings.movieId": req.params.movieId }}, // aggregation where clause
                { $group: { "_id": "$Ratings.movieId", "rate": { $avg: "$Ratings.value" }}}
            ])
        }

        movie.avgRating = movie.avgRating?.[0]?.rate

        if(movie.avgRating == null)
            movie.avgRating = movie.vote_average

        return res.render('movie', { movie, validator, req, pageTitle, cssStyles, jsScripts })
    } catch (error) {
        return res.send(error.stack)
    }
}

const addFavorites = async (req, res) => {
    try {
        var hasMovie = false
        for(var c = 0; c < req.favorites.length; c++) {
            if(req.favorites[c].movieId == req.params.movieId) {
                hasMovie = true
                break
            }
        }

        if(!hasMovie) {
            await Users.updateOne({ id: req.id }, { $push:{Favorites:{ movieId: req.params.movieId }} })
            req.favorites.push({ movieId: req.params.movieId })

            const user = {
                id: req.id,
                firstName: req.firstName,
                ratings: req.ratings,
                favorites: req.favorites
            }
    
            if(req.Image != null)
                user.Image = req.Image
    
            const token = userController.generateToken(user)
    
            res.cookie('auth', `Bearer ${token}`, {
                httpOnly: true,
                secure: true
            })
        }

        return res.redirect('http://localhost:3000')
    } catch (error) {
        return res.send(error.stack)
    }
}

const removeFavorite = async (req, res) => {
    try {
        var favorites = []
        await Users.updateOne({ id: req.id }, { $pull:{Favorites:{ movieId: req.params.movieId }} })

        req.favorites.forEach(function (fav) {
            if(fav.movieId != req.params.movieId)
                favorites.push(fav)
        })

        const user = {
            id: req.id,
            firstName: req.firstName,
            ratings: req.ratings,
            favorites: favorites
        }

        if(req.Image != null)
            user.Image = req.Image

        const token = userController.generateToken(user)

        res.cookie('auth', `Bearer ${token}`, {
            httpOnly: true,
            secure: true
        })

        return res.redirect('http://localhost:3000')
    } catch (error) {
        return res.send(error.stack)
    }
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
            ratings: req.ratings,
            favorites: req.favorites
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
        
        return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error.stack)
    }
}

module.exports = {
    getMovies,
    getMovie,
    addFavorites,
    removeFavorite,
    rateMovie
}