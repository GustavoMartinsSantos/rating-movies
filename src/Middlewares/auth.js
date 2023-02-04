const JWT = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers.auth

    if(!authHeader)
        return res.status(401).send('Token não enviado')

    const tokenParts = authHeader.split(' ')

    if(!tokenParts.length == 2)
        return res.status(401).send('Token formatado incorretamente')

    if(!/^Bearer$/i.test(tokenParts[0]))
        return res.status(401).send('Bearer não existente no token ' + tokenParts[0])
    
    JWT.verify(tokenParts[1], process.env.SECRET, (err, decoded) => {
        if(err)
            return res.status(401).send('Token incorreto!')

        req.id = decoded.id
        req.firstName = decoded.firstName
        req.image = decoded.Image

        return next()
    })
}