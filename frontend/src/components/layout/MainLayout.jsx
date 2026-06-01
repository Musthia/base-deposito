import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({
    children
}) {

    return (

        <div style={styles.container}>

            <Sidebar />

            <div style={styles.content}>

                <Header />

                <main style={styles.main}>

                    {children}

                </main>

            </div>

        </div>
    );
}

const styles = {

    container: {

        display: "flex",

        height: "100vh"
    },

    content: {

        flex: 1,

        display: "flex",

        flexDirection: "column"
    },

    main: {

        flex: 1,

        padding: "20px",

        overflow: "auto"
    }
};