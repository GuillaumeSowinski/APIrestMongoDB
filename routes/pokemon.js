const express = require("express")
const Pokemon = require("../models/pokemon")
const pokeApi = require("../services/pokeapi")

const router = express.Router()

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// Pseudo-CP façon Pokémon GO, calculé depuis les stats de base de la PokéAPI
function computeCp(stats) {
    const base = {}
    for (const s of stats) base[s.stat.name] = s.base_stat
    return Math.floor(
        (0.7953 ** 2 * (base.attack + 15) * Math.sqrt(base.defense + 15) * Math.sqrt(base.hp + 15)) / 10
    )
}

// Types PokéAPI (anglais) → noms français (liste fermée des 18+2 types)
const TYPES_FR = {
    normal: "Normal",
    fighting: "Combat",
    flying: "Vol",
    poison: "Poison",
    ground: "Sol",
    rock: "Roche",
    bug: "Insecte",
    ghost: "Spectre",
    steel: "Acier",
    fire: "Feu",
    water: "Eau",
    grass: "Plante",
    electric: "Électrique",
    psychic: "Psy",
    ice: "Glace",
    dragon: "Dragon",
    dark: "Ténèbres",
    fairy: "Fée",
    stellar: "Stellaire",
    unknown: "Inconnu"
}

function mapFromPokeApi(data, frenchName) {
    return {
        name: frenchName ?? capitalize(data.name),
        hp: data.stats.find((s) => s.stat.name === "hp").base_stat,
        cp: computeCp(data.stats),
        picture: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((t) => TYPES_FR[t.type.name] ?? capitalize(t.type.name))
    }
}

router.get("/", async (req, res) => {
    const pokemons = await Pokemon.find()
    res.json(pokemons)
})

router.get("/suggestions", async (req, res) => {
    try {
        res.json(await pokeApi.getSuggestions(req.query.q ?? ""))
    } catch {
        res.status(502).json({ message: "PokéAPI injoignable" })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const pokemon = await Pokemon.findById(req.params.id)
        if (!pokemon) {
            return res.status(404).json({ message: "Pokemon introuvable" })
        }
        res.json(pokemon)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const pokemon = new Pokemon(req.body)
        await pokemon.save()
        res.status(201).json(pokemon)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post("/import", async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim().toLowerCase() : ""
    if (!name) {
        return res.status(400).json({ message: "Le nom du pokemon est requis" })
    }
    try {
        // Anti-doublon insensible à la casse (échapper les caractères spéciaux
        // pour ne pas interpréter la saisie comme une regex)
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const existing = await Pokemon.findOne({ name: { $regex: `^${escaped}$`, $options: "i" } })
        if (existing) {
            return res.status(409).json({ message: `${existing.name} est déjà présent` })
        }

        const slug = await pokeApi.resolveSlug(name)
        let data
        try {
            data = await pokeApi.getPokemon(slug)
        } catch (error) {
            const status = error.status === 404 ? 404 : 502
            return res.status(status).json({
                message: status === 404 ? "Pokemon introuvable sur la PokéAPI" : "PokéAPI injoignable"
            })
        }

        const frenchName = await pokeApi.getFrenchName(slug)
        const finalName = frenchName ?? capitalize(data.name)
        const escapedName = finalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const dup = await Pokemon.findOne({ name: { $regex: `^${escapedName}$`, $options: "i" } })
        if (dup) {
            return res.status(409).json({ message: `${dup.name} est déjà présent` })
        }
        const pokemon = new Pokemon(mapFromPokeApi(data, frenchName))
        await pokemon.save()
        res.status(201).json(pokemon)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const pokemon = await Pokemon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!pokemon) {
            return res.status(404).json({ message: "Pokemon introuvable" })
        }
        res.json(pokemon)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const pokemon = await Pokemon.findByIdAndDelete(req.params.id)
        if (!pokemon) {
            return res.status(404).json({ message: "Pokemon introuvable" })
        }
        res.json({ message: "Pokemon supprimé" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router
