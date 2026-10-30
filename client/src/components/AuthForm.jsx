import { useState } from "react"
import { login, register } from "../api.js"

export default function AuthForm({ onLoggedIn }) {
    const [mode, setMode] = useState("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setError(null)
            if (mode === "register") {
                try {
                    await register(username, password)
                } catch (err) {
                    setError(err.message)
                    return
                }
                try {
                    await login(username, password)
                } catch {
                    setMode("login")
                    setError("Compte créé. Connectez-vous.")
                    return
                }
            } else {
                await login(username, password)
            }
            onLoggedIn(username)
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <form className="form auth" onSubmit={handleSubmit}>
            <h2>{mode === "login" ? "Connexion" : "Inscription"}</h2>
            {error && <p className="error">{error}</p>}
            <input
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                placeholder="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <div className="actions">
                <button type="submit">{mode === "login" ? "Se connecter" : "Créer le compte"}</button>
                <button
                    type="button"
                    className="secondary"
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                    {mode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
            </div>
        </form>
    )
}
