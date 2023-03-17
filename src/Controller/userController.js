const JWT    = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Users  = require('../Model/Users')

function generateToken (params = {}) {
    return JWT.sign(params, process.env.SECRET, {
        expiresIn: 86400
    })
}

const create = async (req, res) => {
    let jsScripts = ['user.js']
    let cssStyles = ['user.css']
    let pageTitle = 'Cadastrar-se'

    return res.render('register', { pageTitle, cssStyles, jsScripts, error: req?.error })
}

const register = async (req, res) => {
    try {
        const { name, email, passwd } = req.body
        let error
        
        if(!name || !email || !passwd)
            error = 'Elementos POST não enviados!'

        let names = name.trim().replace(/  +/g, ' ')

        let user = {
            firstName: names.substring(0, names.indexOf(' ')), 
            lastName: names.substring(names.indexOf(' ')+1),
            email,
            password: passwd
        }

        if(req?.file?.filename)
            user['Image'] = { name: req.file.filename }

        if(await Users.findOne({email}))
            error = 'Email já cadastrado!'

        if(error != null) {
            req.error = error
            return create(req, res)
        }

        user = await Users.create(user)

        const token =  generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name, ratings: user, favorites: user.Favorites})

        res.cookie('auth', `Bearer ${token}`, {
            httpOnly: true,
            secure: true
        })

        return res.redirect('http://localhost:3000')
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
    create,
    register,
    auth,
    login,
    update,
    generateToken
}