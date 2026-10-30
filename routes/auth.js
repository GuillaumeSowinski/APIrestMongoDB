const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const { TOKEN_SECRET } = require("../middlewares/auth")

const router = express.Router()

router.post("/register", async (req, res) => {
    const { username, password } = req.body ?? {}
    if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
        return res.status(400).json({ message: "Username et password sont requis" })
    }
    try {
        const hash = await bcrypt.hash(password, 10)
        await User.create({ username: username.trim(), password: hash })
        res.status(201).json({ message: "Utilisateur créé" })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Nom d'utilisateur déjà pris" })
        }
        res.status(500).json({ message: "Erreur serveur" })
    }
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {}
    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Username et password sont requis" })
    }
    try {
        const user = await User.findOne({ username: username.trim() })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Identifiants incorrects" })
        }
        const token = jwt.sign({ userId: user._id.toString() }, TOKEN_SECRET, { expiresIn: "24h", algorithm: "HS256" })
        res.json({ token })
    } catch {
        res.status(500).json({ message: "Erreur serveur" })
    }
})

module.exports = router
