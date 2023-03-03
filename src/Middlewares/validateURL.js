const API = require('../Model/API')
const Critics = require('../Model/Critics')

module.exports = async (req, res, next) => {
    const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
    let movie = await new API(link).request()

    if(!movie.title) {
        const link = `https://api.themoviedb.org/3/tv/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let series = await new API(link).request()

        if(!series.name)
            res.redirect('http://localhost:3000/')
    }

    return next()
}