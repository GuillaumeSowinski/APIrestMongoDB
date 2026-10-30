# Pokédex — TP API REST NodeJS + MongoDB

API REST Express 5 + MongoDB (Mongoose) avec authentification JWT, et client
React (Vite). Les pokemons sont importés depuis la [PokéAPI](https://pokeapi.co)
(nom français, types traduits, artwork officiel, CP calculé façon Pokémon GO)
avec autocomplétion des noms en français.

## Prérequis

- **Node.js ≥ 18** (fetch natif utilisé)
- **MongoDB** en marche localement sur `mongodb://localhost:27017`
  (la base `pokemon` est créée automatiquement, inutile de la préparer)
- Une connexion internet (imports et suggestions via la PokéAPI)

## Installation

```bash
# API (racine)
npm install

# Client React
cd client
npm install
```

Aucune configuration nécessaire : la clé privée JWT (`private.key`) est
**générée automatiquement** au premier démarrage du serveur si elle est absente.

## Lancement

```bash
# Terminal 1 — API sur http://localhost:8000
node index.js

# Terminal 2 — Client sur http://localhost:5173
cd client
npm run dev
```

Ouvrir http://localhost:5173, créer un compte (« S'inscrire ») puis se connecter.

## Fonctionnalités

- **Auth JWT** : register/login (bcrypt), tokens signés HS256 (clé `private.key`,
  générée automatiquement), toute l'API `/api/pokemon` protégée par middleware.
- **Import PokéAPI** : taper un nom ou un numéro (ou choisir dans les
  suggestions FR) → nom français, HP, CP calculé, artwork officiel, types FR.
- **CRUD** : liste, édition manuelle, suppression.

## API

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | non | Créer un compte |
| POST | `/api/auth/login` | non | Obtenir un token (24 h) |
| GET | `/api/pokemon` | oui | Lister les pokemons |
| GET | `/api/pokemon/:id` | oui | Détail d'un pokemon |
| GET | `/api/pokemon/suggestions?q=pi` | oui | Suggestions FR (max 8) |
| POST | `/api/pokemon/import` | oui | Importer depuis la PokéAPI |
| POST | `/api/pokemon` | oui | Créer manuellement |
| PUT | `/api/pokemon/:id` | oui | Modifier |
| DELETE | `/api/pokemon/:id` | oui | Supprimer |

Toutes les réponses d'erreur sont en JSON : `{ "message": "…" }`.
