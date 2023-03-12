const Comments = require('../Model/Comments')
const Critics = require('../Model/Critics')
const { ObjectId } = require('mongodb');

const add = async (req, res) => {
    try {
        const { description } = req.body
            
        if(!description)
            return res.status(400).send('Elementos POST não enviados!')

        if(!ObjectId.isValid(req.params.criticId))
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        let critic = await Critics.findOne({ _id: req.params.criticId })
        
        if(critic == null)
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        var comment = {
            description,
            User: req.id
        }

        comment = await Comments.create(comment)

        await Critics.updateOne({ _id: req.params.criticId }, { $push: { Comments: comment.id } })

        return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error.stack)
    }
}

const update = async(req, res) => {
    try {
        const { description } = req.body

        if(!description)
            return res.status(400).send('Elementos PATCH não enviados!')
        if((await Comments.find({$and: [{ _id: req.params.commentId}, {User: req.id }]})).length == 0)
            return res.status(403).send('O usuário não possui permissão para alterar este comentário.')

        await Comments.updateOne({ _id: req.params.commentId }, {$set: {description: description} })
    } catch (error) {
        return res.send(error.stack)
    }
}

const addReply = async(req, res) => {
    try { // adding reply
        const { description } = req.body
            
        if(!description)
            return res.status(400).send('Elementos POST não enviados!')
        if((await Comments.find({$and: [{ _id: req.params.parentCommentId}]})).length == 0)
            return res.status(403).send('Comentário incorreto.')
        
        var comment = {
            description,
            User: req.id
        }

        comment = await Comments.create(comment)

        // the comment is a reply to another comment
        await Comments.updateOne({ _id: req.params.parentCommentId }, { $push: { Replies: comment.id } })

        return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error.stack)
    }
}

const like = async(req, res) => {
    try {
        let comment = await Comments.findOne({ _id: req.params.commentId})

        if(comment == null)
            return res.status(403).send('Comentário incorreto.')

        if(comment.Likes.includes(req.id)) // unlikes the comment
            await Comments.updateOne({ _id: comment.id }, { $pull: { Likes: req.id } })
        else                               // likes the comment
            await Comments.updateOne({ _id: comment.id }, { $push: { Likes: req.id } })

        return res.redirect('http://localhost:3000/movie/' + req.params.movieId)
    } catch (error) {
        return res.send(error.stack)
    }
}

const remove = async (comment) => {
    comment.Replies.forEach(async function (reply) {
        await remove(reply)
    });

    return await Comments.deleteOne(comment._id)
}

const deleteComment = async (req, res) => {
    try {
        let comment = await Comments.findOne({$and: [{ _id: req.params.commentId}, {User: req.id }]})

        if(comment == null)
            return res.status(403).send('O usuário não possui permissão para deletar este comentário.')

        if(!ObjectId.isValid(req.params.criticId))
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        let critic = await Critics.findOne({ _id: req.params.criticId })
        
        if(critic == null)
            return res.redirect('http://localhost:3000/movie/' + req.params.movieId)

        await Critics.updateOne({ id: req.params.criticId }, { $pull: { Comments: comment._id } })
        await Comments.updateOne({ Replies: comment._id }, { $pull: { Replies: comment._id } })
        
        return await remove(comment)
    } catch (error) {
        return res.send(error.stack)
    }
}

module.exports = {
    add,
    update,
    addReply,
    like,
    remove,
    deleteComment
}