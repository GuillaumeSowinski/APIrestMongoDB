import { useEffect, useState } from "react"
import { getSuggestions, importPokemon, updatePokemon } from "../api.js"

export default function PokemonForm({ editing, onSaved, onCancel }) {
    const [name, setName] = useState(editing?.name ?? "")
    const [hp, setHp] = useState(editing?.hp ?? "")
    const [cp, setCp] = useState(editing?.cp ?? "")
    const [picture, setPicture] = useState(editing?.picture ?? "")
    const [types, setTypes] = useState(editing?.types?.join(", ") ?? "")
    const [error, setError] = useState(null)
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState(null)
    const [suggestions, setSuggestions] = useState([])

    async function handleImport(e) {
        e.preventDefault()
        try {
            setError(null)
            await importPokemon(selected?.slug ?? query)
            setSelected(null)
            onSaved()
        } catch (err) {
            setError(err.message)
        }
    }

    function selectSuggestion(s) {
        setSelected(s)
        setSuggestions([])
    }

    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }
        let ignore = false
        const timer = setTimeout(() => {
            getSuggestions(query.trim())
                .then((data) => {
                    if (!ignore) setSuggestions(data)
                })
                .catch(() => {
                    if (!ignore) setSuggestions([])
                })
        }, 250)
        return () => {
            ignore = true
            clearTimeout(timer)
        }
    }, [query])

    async function handleSubmit(e) {
        e.preventDefault()
        const pokemon = {
            name,
            hp: Number(hp),
            cp: Number(cp),
            picture,
            types: types.split(",").map((t) => t.trim()).filter(Boolean)
        }
        try {
            setError(null)
            await updatePokemon(editing._id, pokemon)
            onSaved()
        } catch (err) {
            setError(err.message)
        }
    }

    // Mode ajout : import depuis la PokéAPI
    if (!editing) {
        return (
            <form className="form" onSubmit={handleImport}>
                <h2>Ajouter un pokemon</h2>
                {error && <p className="error">{error}</p>}
                <input
                    placeholder="Nom ou numéro (ex. pikachu ou 25)"
                    value={selected?.name ?? query}
                    onChange={(e) => {
                        setSelected(null)
                        setQuery(e.target.value)
                    }}
                    aria-expanded={suggestions.length > 0}
                    required
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions" role="listbox">
                        {suggestions.map((s) => (
                            <li key={s.slug}>
                                <button type="button" onClick={() => selectSuggestion(s)}>
                                    {s.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="actions">
                    <button type="submit">Importer</button>
                </div>
            </form>
        )
    }

    // Mode édition : formulaire manuel (inchangé)
    return (
        <form className="form" onSubmit={handleSubmit}>
            <h2>Modifier {editing.name}</h2>
            {error && <p className="error">{error}</p>}
            <input
                placeholder="Nom *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                placeholder="HP"
                type="number"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
            />
            <input
                placeholder="CP"
                type="number"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
            />
            <input
                placeholder="URL de l'image"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
            />
            <input
                placeholder="Types séparés par des virgules"
                value={types}
                onChange={(e) => setTypes(e.target.value)}
            />
            <div className="actions">
                <button type="submit">Enregistrer</button>
                <button type="button" className="secondary" onClick={onCancel}>
                    Annuler
                </button>
            </div>
        </form>
    )
}
