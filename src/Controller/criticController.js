const API = require('../Model/API')
const { ObjectId } = require('mongodb');
const Critics  = require('../Model/Critics')
const commentController = require('../Controller/commenController')

const create = async (req, res) => {
    try {
        let pageTitle = 'Avaliar Filme'
        let cssStyles = ['navbar.css']
        let jsScripts = ['navbar.js']

        const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let movie = await new API(link).request()

        return res.render('critic', { pageTitle, req, dir: "../../", cssStyles, jsScripts, movie })
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

const show = async (req, res) => {    
    try {
        let pageTitle = 'Editar Avaliação'
        let cssStyles = ['navbar.css']
        let jsScripts = ['jQuery.js', 'navbar.js']

        const link = `https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${process.env.API_KEY}&language=pt-BR`
        let movie = await new API(link).request()

        if(!ObjectId.isValid(req.params.criticId))
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        let critic = await Critics.findOne({ _id: req.params.criticId })
        
        if(critic == null)
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
        
        return res.render('critic', { pageTitle, req, dir: '../../../', cssStyles, jsScripts, movie, critic })
    } catch(error) {
        return res.send(error)
    }
}

const update = async (req, res) => {
    try {
        const { title, description } = req.body

        if(!title || !description)
            return res.status(400).send('Elementos PUT não enviados!')

        if(!ObjectId.isValid(req.params.criticId))
            return res.status(404).send('Crítica inválida!')

        // user has not authorization
        if((await Critics.find({$and: [{ _id: req.params.criticId}, {User: req.id }]})).length == 0)
            return res.status(403).send('Usuário não possui permissão!')

        await Critics.updateOne({ _id: req.params.criticId }, { $set: {title: title, description: description} })
    } catch(error) {
        return res.send(error)
    }
}

const remove = async (req, res) => {
    try {
        if(!ObjectId.isValid(req.params.criticId))
            return res.status(404).send('Crítica inválida!')

        let critic = await Critics.findOne({$and: [{ _id: req.params.criticId}, {User: req.id }]})
        // user has not authorization
        if(critic == null)
            return res.status(403).send('Usuário não possui permissão!') 

        critic.Comments.forEach(async function (comment) {
            await commentController.remove(comment)
        })

        await Critics.deleteOne({ _id: req.params.criticId })
    } catch(error) {
        return res.send(error)
    }
}

module.exports = {
    create,
    add,
    show,
    update,
    remove
}