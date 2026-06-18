export default function Sidebar({ openTab }) {

    const abrirUsuarios = () => {
        openTab({
            id: "usuarios",
            title: "Usuarios",
            component: <div>Gestión de usuarios</div>
        });
    };

    const abrirConsulta = () => {
        openTab({
            id: "consulta_general",
            title: "Consulta General",
            component: <div>Pantalla de consulta</div>
        });
    };

    return (
        <div style={styles.sidebar}>
            <button onClick={abrirUsuarios}>Usuarios</button>
            
            <button onClick={abrirConsulta}>Consultas</button>
        </div>
    );
}

const styles = {
    sidebar: {
        width: "200px",
        background: "#1e1e2f",
        color: "white",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    }
};