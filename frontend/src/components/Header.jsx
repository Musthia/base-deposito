import { useAuthStore } from "../../auth/authStore";

export default function Header() {

    const user = useAuthStore(
        (s) => s.user
    );

    return (

        <header style={styles.header}>

            <div>
                Sistema DatCorr
            </div>

            <div>
                {user?.usuario || "Usuario"}
            </div>

        </header>
    );
}

const styles = {

    header: {

        height: "60px",

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        padding: "0 20px",

        background: "#374151",

        color: "white"
    }
};