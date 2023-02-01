const express = require('express')
const Comments = require('../Model/Comments')
const Critics = require('../Model/Critics')
const authMiddleware = require('../Middlewares/auth')

const router = express.Router()
router.use(authMiddleware)

router.post('/:movieId/critic/:criticId/comment', async (req, res) => {
    try {
        const { description } = req.body
            
        if(!description)
            return res.status(400).send('Elementos POST não enviados!')
        
        var comment = {
            description,
            User: req.id
        }

        comment = await Comments.create(comment)

        await Critics.updateOne({ _id: req.params.criticId }, { $push: { Comments: comment.id } })

        res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error)
    }
})

router.patch('/:movieId/critic/:criticId/comment/:commentId', async(req, res) => {
    try {
        const { description } = req.body

        if(!description)
            return res.status(400).send('Elementos PATCH não enviados!')
        if((await Comments.find({$and: [{ _id: req.params.commentId}, {User: req.id }]})).length == 0) // testar
            return res.status(403).send('O usuário não possui permissão para alterar este comentário.')

        // set updatedAt with date now
        await Comments.updateOne({ _id: req.params.commentId }, { description: description })

        res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch(error) {
        return res.status(500).send(error)
    }
})

router.post('/:movieId/critic/:criticId/comment/:parentCommentId', async(req, res) => {
    try { // adding reply
        const { description } = req.body
            
        if(!description)
            return res.status(400).send('Elementos POST não enviados!')
        
        var comment = {
            description,
            User: req.id
        }

        comment = await Comments.create(comment)

        // the comment is a reply to another comment
        await Comments.updateOne({ _id: req.params.parentCommentId }, { $push: { Replies: comment.id } })

        res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error)
    }
})

router.post('/:movieId/critic/comment/:commentId/like', async(req, res) => {
    
})

module.exports = router