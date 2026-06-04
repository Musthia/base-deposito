import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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

        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >

            <DialogTitle>

                {usuario
                    ? "Editar Usuario"
                    : "Nuevo Usuario"}

            </DialogTitle>

            <DialogContent>

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

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                >
                    Guardar
                </Button>

            </DialogActions>

        </Dialog>

    );
}