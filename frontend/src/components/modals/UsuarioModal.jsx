import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField
} from "@mui/material";

import { useState, useEffect } from "react";

import { crearUsuario } from "../../services/usuariosService";



export default function UsuarioModal({
    open,
    onClose,
    onSave,
    usuario = null
}) {

    const [form, setForm] = useState({
        usuario: "",
        password: "",   // 👈 IMPORTANTE
        nombre: "",
        apellido: "",
        rol: "",
        nivel_seguridad: ""
    });

    useEffect(() => {

        if (usuario) {

            setForm({
                usuario: usuario.usuario || "",
                nombre: usuario.nombre || "",
                apellido: usuario.apellido || "",
                rol: usuario.rol || "",
                nivel_seguridad: usuario.nivel_seguridad || ""
            });

        } else {

            setForm({
                usuario: "",
                nombre: "",
                apellido: "",
                rol: "",
                nivel_seguridad: ""
            });

        }

    }, [usuario]);

    const handleSave = async () => {
        try {
        
            await crearUsuario({
                usuario: form.usuario,
                password: form.password,
                nombre: form.nombre,
                apellido: form.apellido,
                rol: form.rol,
                nivel_seguridad: Number(form.nivel_seguridad)
            });
        
            onSave();   // solo refresca grid
            onClose();  // cierra modal
        
        } catch (err) {
            console.error("ERROR CREANDO USUARIO:", err);
        }
    };
    
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (

        <Drawer anchor="right" open={open} onClose={onClose}>

            <Box sx={{ width: 400, padding: 2 }}>
            
                <Typography variant="h6">
                    {usuario ? "Editar Usuario" : "Nuevo Usuario"}
                </Typography>

                <TextField
                    margin="dense"
                    label="Usuario"
                    name="usuario"
                    fullWidth
                    value={form.usuario}
                    onChange={handleChange}
                />

                <TextField
                    margin="dense"
                    label="Nombre"
                    name="nombre"
                    fullWidth
                    value={form.nombre}
                    onChange={handleChange}
                />

                <TextField
                    margin="dense"
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    value={form.password || ""}
                    onChange={handleChange}
                />

                <TextField
                    margin="dense"
                    label="Apellido"
                    name="apellido"
                    fullWidth
                    value={form.apellido}
                    onChange={handleChange}
                />

                <TextField
                    margin="dense"
                    label="Rol"
                    name="rol"
                    fullWidth
                    value={form.rol}
                    onChange={handleChange}
                />

                <TextField
                    margin="dense"
                    label="Nivel"
                    name="nivel_seguridad"
                    fullWidth
                    value={form.nivel_seguridad}
                    onChange={handleChange}
                />

            <Button onClick={handleSave}>
                Guardar
            </Button>

            <Button onClick={onClose}>
                Cancelar
            </Button>

        </Box>

    </Drawer>
        );
    }