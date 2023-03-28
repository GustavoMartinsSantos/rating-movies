const JWT    = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Users  = require('../Model/Users')
const fs = require('fs')
const { findOne } = require('../Model/Users')

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

        const token = generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name, ratings: user.Ratings, favorites: user.Favorites})

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

    return res.render('login', { pageTitle, cssStyles, error: req?.error })
}

const auth = async (req, res) => {
    try {
        const { email, password } = req.body
        let error

        if(!email || !password)
            error = 'Elementos POST não enviados!'

        const user = await Users.findOne({email})

        if(!user || !await bcrypt.compare(password, user.password))
            error = 'Email ou senha incorretos!'
        
        if(error != null) {
            req.error = error
            return login(req, res)
        }
            
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

const logout = async (req, res) => {
    try {
        res.clearCookie('auth')

        return res.redirect('http://localhost:3000/auth')
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

const show = async (req, res) => {
    try {
        let jsScripts = ['user.js', 'navbar.js']
        let cssStyles = ['user.css', 'navbar.css']
        let pageTitle = 'Meus Dados'

        let user = await Users.findOne({ _id: req.id })

        return res.render('register', { pageTitle, cssStyles, jsScripts, error: req?.error, req, user })
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

const update = async (req, res) => {
    try {
        const { name, encPasswd, oldPasswd, passwd, confPasswd } = req.body
        let error
        
        if(!name)
            error = 'Elementos POST não enviados!'

        if((passwd && !await bcrypt.compare(oldPasswd, encPasswd)) || passwd != confPasswd)
            error = 'Senha incorreta!'

        let names = name.trim().replace(/  +/g, ' ')

        let user = {
            firstName: names.substring(0, names.indexOf(' ')), 
            lastName: names.substring(names.indexOf(' ')+1),
        }

        if(passwd)
            user['password'] = await bcrypt.hash(passwd, await bcrypt.genSalt(10));

        if(req?.file?.filename) {
            if(req.image != null)
                fs.unlinkSync(`../src/IMG/${req.image}`)

            user['Image'] = { name: req.file.filename }
        }

        if(error != null) {
            req.error = error
            return show(req, res)
        }

        user = await Users.findByIdAndUpdate({ _id: req.id }, user, { new: true})
    
        const token = generateToken({id: req.id, firstName: user.firstName, Image: user.Image.name, ratings: req.Ratings, favorites: req.Favorites})
    
        res.cookie('auth', `Bearer ${token}`, {
            httpOnly: true,
            secure: true
        })

        req.error     = 'Informações salvas com sucesso!'
        req.firstName = user.firstName
        req.image     = user.Image.name
        return show(req, res)
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

const showEmail = async (req, res) => {
    try {
        let jsScripts = ['navbar.js']
        let cssStyles = ['navbar.css']
        let pageTitle = 'Editar email'

        let user = await Users.findOne({ _id: req.id })

        return res.render('updateEmail', { pageTitle, cssStyles, jsScripts, error: req?.error, req, user })
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.stack)
    }
}

const updateEmail = async (req, res) => {
    try {
        const { email, passwd } = req.body
        let error

        if(!email || !passwd)
            error = 'Elementos POST não enviados!'

        let user = await Users.findOne({ _id: req.id })

        if(user.email !== email) {
            if(await Users.findOne({ email: email }))
                error = 'Este email já está cadastrado no sistema!'
        }

        if(!await bcrypt.compare(passwd, user.password))
            error = 'Senha incorreta!'

        if(error != null) {
            req.error = error
            return showEmail(req, res)
        }

        user = {
            email: email
        }

        await Users.updateOne({ _id: req.id }, user)

        req.error = 'Informações salvas com sucesso!'
        return show(req, res)
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
    logout,
    show,
    update,
    showEmail,
    updateEmail,
    generateToken
}