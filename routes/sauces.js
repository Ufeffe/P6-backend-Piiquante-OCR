const express = require('express')
const auth = require('auth')

const router = express.Router()

const stuffCtrl = require('../controllers/sauces')

router.post('/', auth, stuffCtrl.createSauce)
router.get('/', auth, stuffCtrl.getAllSauces)
router.get('/:id', auth, stuffCtrl.getOneSauce)
router.put('/:id', auth, stuffCtrl.modifySauce)
router.delete('/:id', auth, stuffCtrl.deleteSauce);
router.post('/:id/like', auth, stuffCtrl.likeSauce)


module.exports = router