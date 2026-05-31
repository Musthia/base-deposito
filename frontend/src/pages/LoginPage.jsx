import { useState } from "react";
import { login } from "../services/authService";

import { useNavigate } from "react-router-dom";

function LoginPage() {

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const data = await login(
                usuario,
                password
            );

            localStorage.setItem(
                "access_token",
                data.token
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh_token
            );

            localStorage.setItem(
                "usuario",
                data.usuario
            );

            console.log(
                "LOGIN OK",
                data
            );

        } catch (error) {

            console.error(error);

        }
    };

    return (

        <div>

            <h1>DatCorr</h1>

            <input
                placeholder="Usuario"
                value={usuario}
                onChange={(e) =>
                    setUsuario(e.target.value)
                }
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <button onClick={handleLogin}>
                Ingresar
            </button>

        </div>
    );
}

export default LoginPage;