import { Outlet } from "react-router-dom";

export const MainLayout = () => {

    return (
        <div style={{ display: "flex" }}>

            <aside style={{ width: "200px" }}>
                <h3>Menú</h3>
                <p>Usuarios</p>
                <p>Reportes</p>
            </aside>

            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

        </div>
    );
};

export default MainLayout;