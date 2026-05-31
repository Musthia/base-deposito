function DashboardPage() {

    const usuario =
        localStorage.getItem("usuario");

    return (

        <div>

            <h1>DatCorr</h1>

            <h2>
                Bienvenido {usuario}
            </h2>

        </div>
    );
}

export default DashboardPage;