const mongoose = require('mongoose')

const saucesSchema = mongoose.Schema({
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    like: { type: Number },
    dislike: { type: Number },
    usersLiked: { type: ["String < userId >"] },
    usersDisliked: { type: ["String < userId >"] }
})

module.exports = mongoose.model('Sauce', saucesSchema)