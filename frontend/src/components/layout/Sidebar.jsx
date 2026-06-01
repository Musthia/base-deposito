import { Link } from "react-router-dom";

export default function Sidebar() {

    return (

        <aside style={styles.sidebar}>

            <h3>DatCorr</h3>

            <nav style={styles.menu}>

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/usuarios">
                    Usuarios
                </Link>

            </nav>

        </aside>
    );
}

const styles = {

    sidebar: {
        width: "220px",
        background: "#1f2937",
        color: "white",
        padding: "20px"
    },

    menu: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    }
};