const API = require('../Model/API')
const Critics = require('../Model/Critics')
const validator = require('escape-html')
const Users = require('../Model/Users')
const userController = require('../Controller/userController')

const getMovies = async (req, res) => {
    try {
        let link, results, topRatedMovies
        let search    = req.query.search ?? ""
        let lists     = []
        let favorites = []
        
        if(search != "") {
            link = `https://api.themoviedb.org/3/search/multi?api_key=${process.env.API_KEY}&language=pt-BR&query=${search}&page=1`
            results = await new API(link).request()
            results = results.results

            lists.push({ title: `Pesquisar por ${search}`,
                         movies: results })
        }

        link = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=pt-BR&page=1`
        results = await new API(link).request()
        results = results.results

        lists.push({ title: "Populares",
                     movies: results })

        link = `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}&language=pt-BR&page=1`
        results = await new API(link).request()
        results = results.results

        topRatedMovies = await Users.aggregate([
            { $unwind: "$Ratings" }, // get only movies that has ratings equal or above 8
            { $match: { "Ratings.value": { $gte: 8 } }},
            { $group: { "_id": "$Ratings.movieId", "rate": { $avg: "$Ratings.value" }}}
        ])

        for(let i = 0; i < topRatedMovies.length; i++) {
            link = `https://api.themoviedb.org/3/movie/${topRatedMovies[i]._id}?api_key=${process.env.API_KEY}&language=pt-BR`
            movie = await new API(link).request()

            if(!movie.title) {
                link = `https://api.themoviedb.org/3/tv/${topRatedMovies[i]._id}?api_key=${process.env.API_KEY}&language=pt-BR`
                movie = await new API(link).request()
            }

            movie.vote_average = topRatedMovies[i].rate
            
            results.push(movie)
        }

        results.sort(function (a, b) {
            return b.vote_average - a.vote_average
        }) // goes from the best rated movies to the lowest rating ones

        lists.push({ title: "Mais bem avaliados",
                     movies: results })

        if(req?.id != undefined) {
            for(let c = 0; c < req.favorites.length; c++) {
                link = `https://api.themoviedb.org/3/movie/${req.favorites[c].movieId}?api_key=${process.env.API_KEY}&language=pt-BR&page=1`
                results = await new API(link).request()
                
                if(!results.title) {
                    link = `https://api.themoviedb.org/3/tv/${req.favorites[c].movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
                    results = await new API(link).request()
                }

                favorites.push(results)
            }

            if(req.favorites.length > 0)
                lists.push({ title: "Lista de Relevância",
                            movies: favorites })
        }

        link = `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.API_KEY}&language=pt-BR&page=1`
        results = await new API(link).request()
        results = results.results

        lists.push({ title: "Em exibição / Em breve",
                     movies: results })

        let cssStyles = ['style.css']
        let pageTitle = 'Rating Movies'

        return res.render('main', { pageTitle, validator, req, search, lists, cssStyles })
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

        let cssStyles = ['movie.css']
        let jsScripts = ['movie.js', 'jQuery.js']
        let pageTitle = movie.title

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
        let hasMovie = false
        for(let c = 0; c < req.favorites.length; c++) {
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
        let favorites = []
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
        let newRate = true

        if(!rate)
            return res.status(400).send('Elementos POST não enviados!')

        for(let i = 0; i < req.ratings.length; i++) {
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