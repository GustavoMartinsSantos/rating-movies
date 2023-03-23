const express          = require('express')
const router           = express.Router()
const multer           = require('multer')
const auth             = require('../Middlewares/auth')
const validateURL      = require('../Middlewares/validateURL')
const userController   = require('../Controller/userController')
const movieController  = require('../Controller/movieController')
const criticController = require('../Controller/criticController')
const commenController = require('../Controller/commenController')
const optionalAuth     = require('../Middlewares/optionalAuth')
const multerConfig     = require('../Middlewares/multer')

// user routes
router.get('/register', userController.create)
router.post('/register', multer(multerConfig).single('image'), userController.register)
router.get('/edit-profile', auth, userController.show)
router.put('/edit-profile', [auth, multer(multerConfig).single('image')], userController.update)
router.get('/auth', userController.login)
router.post('/auth', userController.auth)
router.get('/logout', userController.logout)

// movie routes
router.get('/', [optionalAuth], movieController.getMovies)
router.post('/movie/:movieId/favorites', [auth, validateURL], movieController.addFavorites)
router.post('/movie/:movieId/unfavorite', [auth, validateURL], movieController.removeFavorite)
router.get('/movie/:movieId', [optionalAuth, validateURL], movieController.getMovie)
router.post('/movie/:movieId', [auth, validateURL], movieController.rateMovie)

// critic routes
router.get('/movie/:movieId/critic/', [auth, validateURL], criticController.create)
router.post('/movie/:movieId/critic/', [auth, validateURL], criticController.add)
router.get('/movie/:movieId/critic/:criticId', [auth, validateURL], criticController.show)
router.put('/movie/:movieId/critic/:criticId', [auth, validateURL], criticController.update)
router.delete('/movie/:movieId/critic/:criticId', [auth, validateURL], criticController.remove)

// comment routes
router.post('/movie/:movieId/critic/:criticId/comment', auth, commenController.add)
router.patch('/movie/:movieId/critic/:criticId/comment/:commentId', auth, commenController.update)
router.post('/movie/:movieId/critic/:criticId/comment/:parentCommentId', auth, commenController.addReply)
router.get('/movie/:movieId/critic/:criticId/comment/:commentId/like', auth, commenController.like)
router.delete('/movie/:movieId/critic/:criticId/comment/:commentId', auth, commenController.deleteComment)

module.exports = router