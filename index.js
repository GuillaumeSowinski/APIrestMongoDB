const express = require("express")
const mongoose = require("mongoose")

const pokemonRoutes = require("./routes/pokemon")
const authRoutes = require("./routes/auth")
const { auth } = require("./middlewares/auth")

const app = express()

mongoose.connect("mongodb://localhost:27017/pokemon")
        .then(() => console.log('Connexion à MongoDB réussie'))
        .catch((error) => console.log('Connexion à MongoDB échouée :', error.message))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRoutes)
app.use("/api/pokemon", auth, pokemonRoutes)

app.use((req, res) => res.status(404).json({ message: "not found" }))

// Middleware d'erreurs global (4 arguments)
app.use((error, req, res, next) => {
    console.error(error)
    if (error.name === "CastError") {
        return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Erreur serveur" })
})

app.listen(8000, () => {
    console.log('App listen on port 8000')
})
