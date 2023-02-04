const mongoose = require('mongoose')

const CriticSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    movieId:{
        type: String,
        required: true
    },
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
    }],
    Comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        autopopulate: true
    }]
}, { timestamps: true })

CriticSchema.plugin(require('mongoose-autopopulate'))

module.exports = mongoose.model('Critic', CriticSchema)