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

        return res.send({user, token: generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name})})
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
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

        return res.send({user, token: generateToken({id: user.id, firstName: user.firstName, Image: user.Image.name})})
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
            res.status(400).send('Elementos POST não enviados!')

        // get id by token
        if(!await Users.findByIdAndUpdate(req.id, userData))
            return res.send('Usuário não encontrado!')
        
        return res.send('Usuário atualizado com sucesso.')
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
}

module.exports = {
    register,
    auth,
    update
}