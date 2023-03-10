const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Users = require('../Model/Users')

function generateToken (params = {}) {
    return JWT.sign(params, process.env.SECRET, {
        expiresIn: 86400
    })
}

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, Image } = req.body
        var user = {
            firstName, lastName, email, password, Image
        }

        if(!firstName || !lastName || !email || !password)
            res.status(400).send('Elementos POST não enviados!')

        if(await Users.findOne({email}))
            return res.status(400).send({error: 'Email já cadastrado!'});

        user = await Users.create(user)

        const token =  generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name, ratings: user, favorites: user.Favorites})

        return res.send({user, token})
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

const login = async (req, res) => {
    let cssStyles = ['login.css']
    let pageTitle = 'Entrar'

    return res.render('login', { pageTitle, cssStyles })
}

const auth = async (req, res) => {
    try {
        const { email, password } = req.body
    
        if(!email || !password)
            return res.status(400).send('Elementos POST não enviados!')

        const user = await Users.findOne({email})

        if(!user)
            return res.status(400).send('Email incorreto!')

        if(!await bcrypt.compare(password, user.password))
            return res.status(400).send('Senha incorreta!')
            
        const token = generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name, ratings: user.Ratings, favorites: user.Favorites})

        res.cookie('auth', `Bearer ${token}`, {
            httpOnly: true,
            secure: true
        })

        return res.redirect('http://localhost:3000')
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
}

const update = async (req, res) => {
    try {
        const { firstName, lastName, Image } = req.body

        const userData = {
            firstName, lastName, Image
        }

        if(!firstName || !lastName)
            return res.status(400).send('Elementos POST não enviados!')

        // get id by token
        if(!await Users.findByIdAndUpdate(req.id, userData))
            return res.send('Usuário não encontrado!')
        
        return res.send('Usuário atualizado com sucesso.')
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

module.exports = {
    register,
    auth,
    login,
    update,
    generateToken
}