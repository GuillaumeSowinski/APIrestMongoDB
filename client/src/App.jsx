import { useEffect, useState } from "react"
import { getPokemons, deletePokemon, logout } from "./api.js"
import AuthForm from "./components/AuthForm.jsx"
import PokemonForm from "./components/PokemonForm.jsx"
import PokemonCard from "./components/PokemonCard.jsx"

export default function App() {
    const [authUser, setAuthUser] = useState(localStorage.getItem("username"))
    const [pokemons, setPokemons] = useState([])
    const [editing, setEditing] = useState(null)
    const [error, setError] = useState(null)

    async function refresh() {
        try {
            setError(null)
            setPokemons(await getPokemons())
        } catch (err) {
            setError(err.message)
            if (!localStorage.getItem("token")) {
                setAuthUser(null)
            }
        }
    }

    useEffect(() => {
        if (authUser) {
            refresh()
        }
    }, [authUser])

    function handleLoggedIn(username) {
        setEditing(null)
        setPokemons([])
        setError(null)
        setAuthUser(username)
    }

    function handleLogout() {
        logout()
        setAuthUser(null)
        setPokemons([])
        setEditing(null)
        setError(null)
    }

    async function handleDelete(id) {
        if (!confirm("Supprimer ce pokemon ?")) return
        try {
            await deletePokemon(id)
            await refresh()
        } catch (err) {
            setError(err.message)
            if (!localStorage.getItem("token")) {
                setAuthUser(null)
            }
        }
    }

    if (!authUser) {
        return (
            <div className="app">
                <h1>Pokédex</h1>
                <AuthForm onLoggedIn={handleLoggedIn} />
            </div>
        )
    }

    return (
        <div className="app">
            <header className="topbar">
                <h1>Pokédex</h1>
                <p>
                    Connecté : {authUser}{" "}
                    <button type="button" className="secondary" onClick={handleLogout}>
                        Déconnexion
                    </button>
                </p>
            </header>
            {error && <p className="error">{error}</p>}
            <PokemonForm
                key={editing ? editing._id : "new"}
                editing={editing}
                onSaved={() => {
                    setEditing(null)
                    refresh()
                }}
                onCancel={() => setEditing(null)}
            />
            <div className="grid">
                {pokemons.map((p) => (
                    <PokemonCard
                        key={p._id}
                        pokemon={p}
                        onEdit={() => setEditing(p)}
                        onDelete={() => handleDelete(p._id)}
                    />
                ))}
            </div>
            {pokemons.length === 0 && !error && <p>Aucun pokemon dans la base.</p>}
        </div>
    )
}
