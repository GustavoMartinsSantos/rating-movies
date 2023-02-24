const express = require('express')
const router = express.Router()
const auth = require('../Middlewares/auth')
const validateURL = require('../Middlewares/validateURL')
const userController   = require('../Controller/userController')
const movieController  = require('../Controller/movieController')
const criticController = require('../Controller/criticController')
const commenController = require('../Controller/commenController')

// user routes
router.post('/register', userController.register)
router.get('/auth', userController.login)
router.post('/auth', userController.auth)
router.put('/user', auth, userController.update)

router.get('/', movieController.getMovies) // movie routes
router.get('/movie/:movieId', [auth, validateURL], movieController.getMovie)
router.post('/movie/:movieId', [auth, validateURL], movieController.rateMovie)

// critic routes
router.get('/movie/:movieId/critic/', [auth, validateURL], criticController.create)
router.post('/movie/:movieId/critic/', [auth, validateURL], criticController.add)
router.get('/movie/:movieId/critic/:criticId', [auth, validateURL], criticController.show)
router.put('/movie/:movieId/critic/:criticId', [auth, validateURL], criticController.update)

// comment routes
router.post('/movie/:movieId/critic/:criticId/comment', auth, commenController.add)
router.patch('/movie/:movieId/critic/:criticId/comment/:commentId', auth, commenController.update)
router.post('/movie/:movieId/critic/:criticId/comment/:parentCommentId', auth, commenController.addReply)
router.get('/movie/:movieId/critic/:criticId/comment/:commentId/like', auth, commenController.like)

module.exports = router