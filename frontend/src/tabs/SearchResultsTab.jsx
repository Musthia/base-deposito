export default function SearchResultsTab({ query, schema, results }) {

    return (
        <div>
            <h3>Resultados</h3>

            <p><strong>Schema:</strong> {schema}</p>
            <p><strong>Búsqueda:</strong> {query}</p>

            <hr />

            {results.map((item, index) => (
                <div key={index} style={styles.item}>
                    {JSON.stringify(item)}
                </div>
            ))}
        </div>
    );
}

const styles = {
    item: {
        padding: "10px",
        marginBottom: "8px",
        background: "#2a2a3d",
        borderRadius: "5px"
    }
};