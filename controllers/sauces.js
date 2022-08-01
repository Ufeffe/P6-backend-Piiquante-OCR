const Sauce = require('../models/Sauce')
const fs = require('fs')

// Initilisation des constantes pour la fonction like/dislike
const USER_LIKE = 1
const USER_DISLIKE = -1
const USER_RESET = 0

// Création d'une nouvelle sauce à partir d'un model
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)

    // Suppression des éléments automatiquement créés et non voulus
    delete sauceObject._id
    delete sauceObject._userId

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    // Recherche et récupération du lien image sinon importation classique
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
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' })
            } else {
                // Récupération du nom de fichier pour suppression des données images de la bdd
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch((error) => res.status(401).json({ message: error }))
                })
            }
        })
        .catch(error => res.status(500).json({ message: error }))
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

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // suppression de l'id de la requete
            delete req.body.userId

            // recuperation de l'id depuis le service auth
            const userIdToAdd = req.auth.userId

            // recuperation du choix de like -1, 0, 1
            const likeOption = req.body.like

            // Option like 
            if (likeOption == USER_LIKE && !idIsPresent(userIdToAdd, sauce.usersLiked)) {
                sauce.usersLiked.push(userIdToAdd)
                sauce.likes++
            }
            // Option Dislike
            if (likeOption == USER_DISLIKE && !idIsPresent(userIdToAdd, sauce.usersDisliked)) {
                sauce.usersDisliked.push(userIdToAdd)
                sauce.dislikes++
            }
            // Option neutre
            if (likeOption == USER_RESET && idIsPresent(userIdToAdd, sauce.usersDisliked)) {
                idToDelete(userIdToAdd, sauce.usersDisliked)
                sauce.dislikes--
            } else if (likeOption == USER_RESET && idIsPresent(userIdToAdd, sauce.usersLiked)) {
                idToDelete(userIdToAdd, sauce.usersLiked)
                sauce.likes--
            }
            sauce.save()
                .then(() => res.status(201).json({ message: 'Like/Dislike modifié !' }))
                .catch(error => res.status(400).json({ error }))
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
    return array.includes(userId)
}