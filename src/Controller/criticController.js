const express = require('express')
const Critics = require('../Model/Critics')
const authMiddleware = require('../Middlewares/auth')

const router = express.Router()
router.use(authMiddleware)

router.post('/:movieId', async (req, res) => {
    try {
        const { title, description } = req.body
        var critic = {
            title, description,
            user: {
                id: req.id,
                movieId: req.params.movieId
            }
        }

        if(!title || !description)
            return res.status(400).send('Elementos POST não enviados!')

        critic = await Critics.create(critic)

        return res.send({critic})
    } catch(error) {
        return res.send(error)
    }
})

module.exports = router
