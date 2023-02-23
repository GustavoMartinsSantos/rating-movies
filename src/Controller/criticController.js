const Critics = require('../Model/Critics')
const API = require('../Model/API')

const create = async (req, res) => {
    var pageTitle = 'Avaliar Filme'

    const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
    let movie = await new API(link).request()

    res.render('critic', { pageTitle, movie })
}

const add = async (req, res) => {
    try {
        const { title, description } = req.body
        var critic = {
            title, description,
            user: {
                id: req.id,
                movieId: req.params.movieId
            }
        }

        if(!title || !description)
            return res.status(400).send('Elementos POST não enviados!')

        critic = await Critics.create(critic)

        return res.send({critic})
    } catch(error) {
        return res.send(error)
    }
}

module.exports = {
    create,
    add
}