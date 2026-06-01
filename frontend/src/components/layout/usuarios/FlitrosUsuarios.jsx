export default function FiltrosUsuarios({
    filtros,
    setFiltros
}) {

    return (
        <div style={{ marginBottom: 20 }}>

            <input
                placeholder="Buscar por nombre"
                value={filtros.search}
                onChange={(e) =>
                    setFiltros({
                        ...filtros,
                        search: e.target.value
                    })
                }
            />

            <select
                value={filtros.rol}
                onChange={(e) =>
                    setFiltros({
                        ...filtros,
                        rol: e.target.value
                    })
                }
            >

                <option value="">Todos</option>
                <option value="Admin">Admin</option>
                <option value="Operador">Operador</option>

            </select>

        </div>
    );
}