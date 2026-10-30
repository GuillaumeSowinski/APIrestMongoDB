const BASE_URL = "/api/pokemon"

const TOKEN_KEY = "token"
const USERNAME_KEY = "username"

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
}

export function logout() {
    clearSession()
}

async function request(url, options) {
    const token = localStorage.getItem(TOKEN_KEY)
    const headers = { ...(options?.headers ?? {}) }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    const res = await fetch(url, { ...options, headers })
    let data = null
    try {
        data = await res.json()
    } catch {
        // corps non JSON (proxy Vite, backend éteint, 204…)
    }
    if (!res.ok) {
        if (res.status === 401) {
            clearSession()
        }
        throw new Error(data?.message || `Erreur ${res.status}`)
    }
    return data
}

export function getPokemons() {
    return request(BASE_URL)
}

export function createPokemon(pokemon) {
    return request(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pokemon)
    })
}

export function updatePokemon(id, pokemon) {
    return request(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pokemon)
    })
}

export function deletePokemon(id) {
    return request(`${BASE_URL}/${id}`, { method: "DELETE" })
}

export function importPokemon(name) {
    return request(`${BASE_URL}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
}

export function getSuggestions(q) {
    return request(`${BASE_URL}/suggestions?q=${encodeURIComponent(q)}`)
}

export function register(username, password) {
    return request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
}

export async function login(username, password) {
    const data = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USERNAME_KEY, username)
    return data
}
