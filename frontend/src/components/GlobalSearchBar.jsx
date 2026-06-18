import { useState } from "react";
import { useSearchService } from "../modules/search/globalSearchService";

export default function GlobalSearchBar({ onResults }) {

    const [query, setQuery] = useState("");
    const [schema, setSchema] = useState("escribania");
    const [loading, setLoading] = useState(false);

    const searchService = useSearchService();

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);

        try {
            const results = await searchService.search({
                schema,
                query
            });

            onResults({
                query,
                schema,
                results
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>

            {/* SELECTOR DE ORGANISMO */}
            <select
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                style={styles.select}
            >
                <option value="escribania">Escribanía</option>
                <option value="igpj">IGPJ</option>
                <option value="igpj_listado_nuevo">IGPJ Listado Nuevo</option>
                <option value="igpj_txt_listado">IGPJ TXT Listado</option>
                <option value="ips">IPS</option>
                <option value="maternidad">Maternidad</option>
                <option value="pediatrico">Pediátrico</option>
            </select>

            {/* INPUT GLOBAL */}
            <input
                type="text"
                placeholder="Buscar en la base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.input}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <button onClick={handleSearch} style={styles.button}>
                {loading ? "Buscando..." : "Buscar"}
            </button>

        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        gap: "10px",
        padding: "10px",
        background: "#1e1e2f",
        color: "white"
    },
    select: {
        padding: "8px",
        borderRadius: "5px"
    },
    input: {
        flex: 1,
        padding: "8px",
        borderRadius: "5px"
    },
    button: {
        padding: "8px 12px",
        borderRadius: "5px",
        cursor: "pointer"
    }
};