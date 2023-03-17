const multer = require('multer')
const path   = require('path')
const crypto = require('crypto')
const userController = require('../Controller/userController')
const Users  = require('../Model/Users')

module.exports = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, '../src/IMG')
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err)
                
                const fileName = hash.toString('hex') + path.extname(file.originalname)

                cb(null, fileName)
            })
        }
    }),
    fileFilter: async (req, file, cb) => {
        const allowedExt = [
            'image/jpeg',
            'image/pjpeg',
            'image/png'
        ]

        if(!allowedExt.includes(file.mimetype)) {
            cb(new Error('Invalid file type.'))
            return false
        }

        if(!await Users.findOne({email: req.query.email}))
            cb(null, true)
        else
            cb(null, false)
    }
}