const Sauce = require('../models/Sauce')
const fs = require('fs')

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)

    delete sauceObject._id
    delete sauceObject._userId

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body }

    delete sauceObject._userId

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' })
            } else {
                Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
                    .catch((error) => res.status(401).json({ message: error }))
            }
        })
        .catch(error => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(() => {
            if (sauce.userId != res.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' })
            } else {
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch((error) => res.status(401).json({ message: error }))

                })
            }
        })
        .catch(error => res.status(500).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
}

exports.likeSauce = (req, res, next) => {

    // recuperation du choix de like -1, 0, 1
    const likeOption = req.params.like

    // recuperation de l'id depuis le service auth
    const userIdToAdd = req.auth.userId

    // suppression de l'id de la requete
    delete sauce._userId

    Sauce.findOne({ _id: req.params.id })
        .then(() => {
            // Option like 
            if (likeOption == 1 && idIsPresent(userIdToAdd, sauce.usersDisliked)) {
                idToDelete(userIdToAdd, sauce.usersDisliked)
                sauce.usersLiked.push(userIdToAdd)
                sauce.like++;
                sauce.dislike--
            } else if (likeOption == 1 && idIsPresent(userIdToAdd, sauce.usersLiked) == false) {
                sauce.usersLiked.push(userIdToAdd)
                sauce.like++;
            }
            // Option Dislike
            if (likeOption == -1 && idIsPresent(userIdToAdd, sauce.usersLiked)) {
                idToDelete(userIdToAdd, sauce.usersLiked)
                sauce.usersDisliked.push(userIdToAdd)
                sauce.like--;
                sauce.dislike++
            } else if (likeOption == -1 && idIsPresent(userIdToAdd, sauce.usersDisliked) == false) {
                sauce.usersDisliked.push(userIdToAdd)
                sauce.dislike++;
            }
            // Option neutre
            if (likeOption == 0 && idIsPresent(userIdToAdd, sauce.usersDisliked)) {
                idToDelete(userIdToAdd, sauce.usersDisliked)
                sauce.dislike--
            } else if (likeOption == 0 && idIsPresent(userIdToAdd, sauce.usersLiked)) {
                idToDelete(userIdToAdd, sauce.usersLiked)
                sauce.like--
            }
        })
        .catch(error => res.status(400).json({ error }))
}

// Permet de connaitre la position de l'id dans un tableau
function idToDelete(userId, array) {
    const idFinder = array.indexOf(array.find(id => id == userId))
    array.splice(idFinder, 1)
}
// Permet de savoir si l'id est présent dans un tableau
function idIsPresent(userId, array) {
    array.includes(userId)
}