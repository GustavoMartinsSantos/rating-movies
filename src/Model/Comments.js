const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    description:{
        type: String,
        required: true
    },
    Replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        autopopulate: true
    }],
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true
    },
    Likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true
    }]
}, { timestamps: true })

CommentSchema.plugin(require('mongoose-autopopulate'))

module.exports = mongoose.model('Comment', CommentSchema)