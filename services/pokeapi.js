const POKEAPI_URL = "https://pokeapi.co/api/v2"
const POKEAPI_GRAPHQL_URL = "https://graphql.pokeapi.co/v1beta2"

let namesCache = null

async function fetchJson(url, options) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
        const error = new Error(`PokéAPI a répondu ${response.status}`)
        error.status = response.status
        throw error
    }
    return response.json()
}

// Repli si GraphQL est indisponible : suggestions en anglais (name = slug)
async function fetchEnglishNames() {
    const data = await fetchJson(`${POKEAPI_URL}/pokemon?limit=1025`)
    return data.results.map((p) => ({ name: p.name, slug: p.name }))
}

async function fetchFrenchNames() {
    const data = await fetchJson(POKEAPI_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: `query {
                pokemonspeciesname(where: {language_id: {_eq: 5}}, limit: 2000) {
                    name
                    pokemonspecy { name }
                }
            }`
        })
    })
    const entries = data?.data?.pokemonspeciesname
    if (!entries?.length) {
        throw new Error("Réponse inattendue de la PokéAPI")
    }
    return entries.map((e) => ({ name: e.name, slug: e.pokemonspecy?.name })).filter((p) => p.slug)
}

// Chargement paresseux + cache ; un échec n'est pas mis en cache
async function loadNames() {
    if (!namesCache) {
        namesCache = fetchFrenchNames()
            .catch(() => fetchEnglishNames())
            .catch((error) => {
                namesCache = null
                throw error
            })
    }
    return namesCache
}

// Insensible à la casse ET aux accents (« evo » trouve « Evoli »)
function normalize(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

async function getSuggestions(query) {
    const normalized = normalize((query ?? "").trim())
    if (!normalized) return []
    const names = await loadNames()
    return names
        .filter((p) => normalize(p.name).startsWith(normalized))
        .slice(0, 8)
}

async function resolveSlug(input) {
    const normalized = normalize(String(input ?? "").trim())
    if (!normalized) return input
    const names = await loadNames().catch(() => null)
    if (!names) return input
    const match = names.find((p) => normalize(p.name) === normalized || p.slug === normalized)
    return match ? match.slug : input
}

async function getPokemon(slug) {
    return fetchJson(`${POKEAPI_URL}/pokemon/${encodeURIComponent(slug)}`)
}

// Nom français du pokemon (null si non traduit ou service indisponible)
async function getFrenchName(slug) {
    try {
        const data = await fetchJson(`${POKEAPI_URL}/pokemon-species/${encodeURIComponent(slug)}`)
        const entry = data.names?.find((n) => n.language?.name === "fr")
        return entry?.name ?? null
    } catch {
        return null
    }
}

module.exports = { getSuggestions, resolveSlug, getPokemon, getFrenchName }
