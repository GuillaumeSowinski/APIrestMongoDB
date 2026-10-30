export default function PokemonCard({ pokemon, onEdit, onDelete }) {
    return (
        <div className="card">
            {pokemon.picture ? (
                <img src={pokemon.picture} alt={pokemon.name} />
            ) : (
                <div className="placeholder">?</div>
            )}
            <h3>{pokemon.name}</h3>
            <div className="stats">
                <span>HP : {pokemon.hp}</span>
                <span>CP : {pokemon.cp}</span>
            </div>
            <div className="types">
                {(pokemon.types ?? []).map((t) => (
                    <span key={t} className="chip">
                        {t}
                    </span>
                ))}
            </div>
            <div className="actions">
                <button onClick={onEdit}>Modifier</button>
                <button className="danger" onClick={onDelete}>
                    Supprimer
                </button>
            </div>
        </div>
    )
}
