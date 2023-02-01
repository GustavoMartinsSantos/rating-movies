const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    passwdRecToken: {
        type: String,
        select: false
    },
    Image: {
        name: {
            type: String
        }
    },
    Favorites: [{
        movieId:{
            type: String
        }
    }]
})

UserSchema.pre(['save'], async function(next) {
    this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));

    next()
})

module.exports = mongoose.model('User', UserSchema)