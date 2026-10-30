const mongoose = require("mongoose")

const pokemonSchema = mongoose.Schema({
    name: { type: String, required: true },
    hp: { type: Number },
    cp: { type: Number },
    picture: { type: String },
    types: { type: [String] },
    created: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Pokemon", pokemonSchema)
