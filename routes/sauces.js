const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const sauceCtrl = require('../controllers/sauces')

// Routes avec gestion de fichiers images
router.post('/', auth, multer, sauceCtrl.createSauce)
router.put('/:id', auth, multer, sauceCtrl.modifySauce)

// Routes sans genstion de fichiers images
router.get('/', auth, sauceCtrl.getAllSauces)
router.get('/:id', auth, sauceCtrl.getOneSauce)
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce)


module.exports = router