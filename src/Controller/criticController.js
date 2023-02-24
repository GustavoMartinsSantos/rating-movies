const Critics = require('../Model/Critics')
const API = require('../Model/API')
const { ObjectId } = require('mongodb');

const create = async (req, res) => {
    try {
        var pageTitle = 'Avaliar Filme'

        const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let movie = await new API(link).request()

        return res.render('critic', { pageTitle, movie })
    } catch(error) {
        return res.send(error)
    }
}

const show = async (req, res) => {    
    try {
        var pageTitle = 'Editar Avaliação'

        const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let movie = await new API(link).request()

        if(!ObjectId.isValid(req.params.criticId))
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        let critic = await Critics.findOne({ _id: req.params.criticId })
        
        if(critic == null)
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
        
        return res.render('critic', { pageTitle, movie, critic })
    } catch(error) {
        return res.send(error)
    }
}

const update = async (req, res) => {
    try {

    } catch(error) {
        return res.send(error)
    }
}

const add = async (req, res) => {
    try {
        const { title, description } = req.body
        
        var critic = {
            title, 
            description, 
            movieId: req.params.movieId, 
            User: req.id
        }

        if(!title || !description)
            return res.status(400).send('Elementos POST não enviados!')

        critic = await Critics.create(critic)

        return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch(error) {
        return res.send(error)
    }
}

module.exports = {
    create,
    add,
    show,
    update
}