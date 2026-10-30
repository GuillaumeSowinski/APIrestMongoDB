const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const jwt = require("jsonwebtoken")

const KEY_PATH = path.join(__dirname, "..", "private.key")

// La clé n'a pas besoin d'être partagée entre installations : les tokens sont
// signés et vérifiés par le même serveur. Si le fichier manque (clone frais),
// on génère une clé locale au premier démarrage.
function readOrCreateSecret() {
    try {
        return fs.readFileSync(KEY_PATH, "utf8").trim()
    } catch {
        const secret = crypto.randomBytes(64).toString("hex")
        fs.writeFileSync(KEY_PATH, secret + "\n", { mode: 0o600 })
        console.log("Clé privée JWT absente : private.key générée automatiquement")
        return secret
    }
}

const TOKEN_SECRET = readOrCreateSecret()

function auth(req, res, next) {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Requête non authentifiée" })
    }
    const token = header.slice(7)
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET, { algorithms: ["HS256"] })
        req.userId = decoded.userId
        next()
    } catch {
        return res.status(401).json({ message: "Requête non authentifiée" })
    }
}

module.exports = { auth, TOKEN_SECRET }
